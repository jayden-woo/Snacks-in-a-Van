const mongoose = require("mongoose");

// Import the models used
const Snack = mongoose.model("Snack");
const OrderLine = mongoose.model("OrderLine");
const Feedback = mongoose.model("Feedback");
const Order = mongoose.model("Order");
const Vendor = mongoose.model("Vendor");

// Number of vendors to be displayed
const N_VENDORS = 5;

// Get the frontpage
const getFrontPage = (req, res) => {
  return res.status(200).render("customer/homepage");
};

// Get a list of the closest vendors
const getVendorsList = (req, res) => {
  Vendor.aggregate([
    {
      $geoNear: {
        near: req.session.location,
        distanceField: "distance",
        spherical: true,
        query: { isOnline: true },
      },
    },
    {
      $limit: N_VENDORS,
    },
  ]).exec((err, result) => {
    // Error occurred during query
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: ["Oops! Something went wrong."] });
    }
    // Convert the distance to km and round to 3 decimal places
    result.map((vendor) => {
      vendor.distance = (vendor.distance / 1000).toFixed(3);
    });
    // Don't need to use lean as pipeline output is already js object
    return res.status(200).render("customer/map", { vendors: result });
  });
};

// Get the menu from database
const getMenu = async (req, res) => {
  try {
    const menu = await Snack.find().lean();
    // Render the menu page
    return res.status(200).render("customer/menu", { list: menu });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .render("error", { code: 400, message: "Oops! Something went wrong." });
  }
};

// Get details of one snack from database by its name
const getSnackByName = async (req, res) => {
  try {
    // Search for a snack by name
    const snack = await Snack.findOne({ name: req.params.snackName }).lean();
    // Snack not found in database
    if (snack === null) {
      return res
        .status(404)
        .render("error", { code: 404, message: "Oops! Snack not found." });
    }
    // Render the snack details page
    return res
      .status(200)
      .render("customer/oneSnack", { oneSnack: snack, user: req.user });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .render("error", { code: 400, message: "Oops! Something went wrong." });
  }
};

// Render the cart page for the client
const getCart = (req, res) => {
  return res.status(200).render("customer/cart", { user: req.user });
};

// Get all the orders details
const getOrders = async (req, res) => {
  try {
    // Check if there's any orders
    const list = await Order.find({ customerID: req.user._id }).limit(1);
    if (!list.length) {
      return res.status(200).render("customer/order", {
        order: [],
        user: JSON.stringify(req.user),
      });
    }
    const orders = await Order
      // Find orders associated with the current customer
      .find({
        customerID: req.user._id,
        status: { $ne: "Cancelled" },
      })
      // Add the vendor van name
      .populate({
        path: "vendorID",
      })
      // Add the snack details
      .populate({
        path: "snacks.snackID",
      })
      // Sort by newest order first
      .sort({
        updatedAt: -1,
      })
      // Convert to a js object
      .lean();
    return res.status(200).render("customer/order", {
      order: orders,
      user: JSON.stringify(req.user),
    });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .render("error", { code: 400, message: "Oops! Something went wrong." });
  }
};

// Get details of one order by its order number
const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order
      // Find the given order that is associated with the current customer
      .findOne({
        customerID: req.user._id,
        orderNumber: req.params.orderNumber,
      })
      // Add the vendor van name
      .populate({
        path: "vendorID",
        select: "username",
      })
      // Add the snack details
      .populate({
        path: "snacks.snackID",
      })
      // Convert to a js object
      .lean();
    return res.status(200).send(order);
  } catch (err) {
    // Error occurred during query
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// Render the feedback page for the client
const getFeedback = (req, res) => {
  return res.status(200).render("customer/feedback", {
    id: req.query._id,
    number: req.query.number,
  });
};

// Save the location of the customer in session
const saveLocation = (req, res) => {
  try {
    req.session.location = {
      type: "Point",
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
    return res.status(200).json({
      success: true,
      message: ["Your location has been successfully captured."],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: ["Oops! Something went wrong. Please try again later."],
    });
  }
};

// Select a vendor to start the order from
const selectVendor = async (req, res) => {
  try {
    // Search for the vendor
    const vendor = await Vendor.findById(req.body._id);
    // Vendor not found in database
    if (vendor === null) {
      return res
        .status(404)
        .json({ success: false, message: ["Oops! Vendor not found."] });
    }
    // Store the vendor in session to be added during order confirmation
    req.session.vendor = vendor;
    return res
      .status(200)
      .json({ success: true, message: ["Vendor selected."] });
  } catch (err) {
    // Error occurred during query
    return res
      .status(400)
      .json({ success: false, message: ["Oops! Something went wrong."] });
  }
};

// Confirm the current order selections
const confirmOrder = async (req, res) => {
  try {
    // Create a list containing all the snacks and quantity
    const orderlist = req.body.orderlist;
    const lineItems = [];
    for (i = 0; i < orderlist.length; i++) {
      lineItems.push(
        new OrderLine({
          snackID: orderlist[i].snackId,
          quantity: parseInt(orderlist[i].quantity),
        })
      );
    }
    // Construct a new order and save it to database
    const orderNumber = await Order.countDocuments();
    const order = new Order({
      orderNumber: orderNumber,
      vendorID: req.body.vendorId || req.session.vendor._id,
      customerID: req.user._id,
      snacks: lineItems,
      total: parseFloat(req.body.price),
    });
    await order.save();
    // Send a notification to the vendor to refresh their page
    req.io.emit("vendor message", order.vendorID);
    return req.res
      .status(200)
      .json({ success: true, message: ["Order placed successfully."] });
  } catch {
    // Error occurred during saving
    return res
      .status(400)
      .json({ success: false, message: ["Oops! Something went wrong."] });
  }
};

// Update the previously confirmed order with new items or quantities
const updateOrder = async (req, res) => {
  try {
    // Find the order from the database
    const order = await Order.findOne({
      _id: req.body.orderId,
      customerID: req.user._id,
    });
    // Order not found in database
    if (order === null) {
      return res
        .status(404)
        .json({ success: false, message: ["Oops! Order not found."] });
    }
    // Create a new list containing all the snacks and quantity
    const orderlist = req.body.orderlist;
    const lineItems = [];
    for (i = 0; i < orderlist.length; i++) {
      lineItems.push(
        new OrderLine({
          snackID: orderlist[i].snackId,
          quantity: parseInt(orderlist[i].quantity),
        })
      );
    }
    // Change the items and the price in the order and save it
    order.snacks = lineItems;
    order.total = parseFloat(req.body.newPrice);
    await order.save();
    // Send a notification to the vendor to refresh their page
    req.io.emit("vendor message", order.vendorID);
    return res.status(200).json({
      success: true,
      message: ["Your order has been successfully updated."],
    });
  } catch (err) {
    // Error occurred during saving
    return res
      .status(400)
      .json({ success: false, message: ["Oops! Something went wrong."] });
  }
};

// Cancel an order by changing its status
const cancelOrder = async (req, res) => {
  try {
    // Find the order from the database
    const order = await Order.findOne({
      _id: req.body.orderId,
      customerID: req.user._id,
    });
    // Snack not found in database
    if (order === null) {
      return res
        .status(404)
        .json({ success: false, message: ["Order does not exist."] });
    }
    // Change the order status to "cancelled" and save it
    order.status = "Cancelled";
    await order.save();
    // Send a notification to the vendor to refresh their page
    req.io.emit("vendor message", order.vendorID);
    return res.status(200).json({
      success: true,
      message: ["Order has been successfully cancelled."],
    });
  } catch (err) {
    // Error occurred during saving
    return res
      .status(400)
      .json({ success: false, message: ["Oops! Something went wrong."] });
  }
};

// Submit a feedback for a previous order
const submitFeedback = async (req, res) => {
  try {
    // Construct a new feedback for the order
    const feedback = new Feedback({
      rating: req.body.rating,
      comment: req.body.comment,
    });
    // Search for the order to place the feedback in
    const order = await Order.findOne({
      _id: req.body._id,
      customerID: req.user._id,
    });
    // Order not found in database
    if (order === null) {
      return res.status(404).send("Order not found.");
    }
    // Add the feedback to the order and save it
    order.feedback = feedback;
    await order.save();
    return res.status(200).json({
      success: true,
      message: ["Feedback has been successfully added for your order."],
    });
    // Error occurred during saving
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: ["Oops! Something went wrong."] });
  }
};

// Export the controller functions
module.exports = {
  getFrontPage,
  getVendorsList,
  getMenu,
  getSnackByName,
  getCart,
  getOrders,
  getOrderByNumber,
  getFeedback,
  saveLocation,
  selectVendor,
  confirmOrder,
  updateOrder,
  cancelOrder,
  submitFeedback,
};
