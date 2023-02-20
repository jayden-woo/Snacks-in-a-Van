const mongoose = require("mongoose");
// Format time
const dayjs = require("dayjs");

// Import the models used
const Order = mongoose.model("Order");

// Time limit to give a discount for orders (15 mins)
const DISCOUNT_TIME = 15 * 60 * 1000;

// Get the front page for a vendor
const getFrontPage = (req, res) => {
  return res.status(200).redirect("/vendor/order");
};

// Get all the outstanding order details
const getOrders = (req, res) => {
  Order.aggregate()
    // Find the outstanding orders associated with the current vendor
    .match({
      vendorID: req.user._id,
      status: { $in: ["Placed", "Fulfilled"] },
    })
    // Add the customer given name
    .lookup({
      from: "customers",
      localField: "customerID",
      foreignField: "_id",
      as: "customerID",
    })
    // Unpack it from an array of one item
    .unwind("customerID")
    // Add the snack details
    .lookup({
      from: "snacks",
      localField: "snacks.snackID",
      foreignField: "_id",
      as: "snacks",
    })
    // Remove unnecessary fields
    .project({
      customerID: {
        _id: 0,
        email: 0,
        password: 0,
        lastName: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    })
    // Add the duration left before discount must be given (in milliseconds)
    .addFields({
      duration: {
        $subtract: [DISCOUNT_TIME, { $subtract: ["$$NOW", "$updatedAt"] }],
      },
    })
    // Sort by oldest order first then "placed" order comes before "fulfilled"
    .sort({
      updatedAt: "asc",
      status: "desc",
    })
    // Execute the pipeline
    .exec((err, result) => {
      if (err) {
        return res.status(400).send("Oops! Something went wrong.");
      }
      // Don't need to use lean as pipeline output is already js object
      return res.status(200).send(result);
    });
};

// View the order list
const viewOrderList = (req, res) => {
  return res.status(200).render("vendor/order");
};

// View the location of the vendor
const viewLocation = (req, res) => {
  return res.status(200).render("vendor/location");
};

// Get details of one order by its order number
const getOrderByNumber = async (req, res) => {
  try {
    let order = await Order
      // Find the given order that is associated with the current vendor
      .findOne({
        vendorID: req.user._id,
        orderNumber: req.params.orderNumber,
      })
      // Add the customer given name
      .populate({
        path: "customerID",
        select: "firstName",
      })
      // Add the snack details
      .populate({
        path: "snacks.snackID",
      })
      // Convert to a js object
      .lean();
    // Add the duration left before discount must be given (in milliseconds)
    order.duration = DISCOUNT_TIME - (new Date() - new Date(order.updatedAt));
    // Format the date to 11:00 am format
    order.pickedUpTime = dayjs(
      new Date(order.updatedAt).getTime() + DISCOUNT_TIME
    ).format("hh:mm a");

    order.discountPrice = order.duration <= 0 ? order.total * 0.8 : order.total;

    return res.status(200).send(order);
  } catch (err) {
    // Error occurred during query
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// Get the order history with picked-up and cancelled orders
const getOrderHistory = async (req, res) => {
  try {
    // Check if there's any orders
    const list = await Order.find({
      vendorID: req.user._id,
      status: "Picked-Up",
    }).limit(1);
    if (!list.length) {
      return res.status(200).send([]);
    }
    const orders = await Order
      // Find the previous orders associated with the current vendor
      .find({
        vendorID: req.user._id,
        status: "Picked-Up",
      })
      // Add the customer given name
      .populate({
        path: "customerID",
        select: "firstName",
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
    return res.status(200).send(orders);
  } catch (err) {
    // Error occurred during query
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// Mark an order as fulfilled and apply discount if time limit passed
const markFulfilled = async (req, res) => {
  try {
    // Search for the order from the database
    const order = await Order.findOne({
      vendorID: req.user._id,
      orderNumber: req.params.orderNumber,
    });
    // Order not found in database
    if (order === null) {
      req.flash("updateMessage", "Order does not exist.");
      return res
        .status(400)
        .send("Sorry, we could not find the order in our database.");
    }
    // Order has already been fulfilled or cancelled
    if (order.status != "Placed") {
      req.flash("updateMessage", "Order could not be fulfilled.");
      return res.status(400).send("Sorry, the order could not be fulfilled.");
    }
    // Check if the time limit for discount has passed
    if (new Date() - new Date(order.updatedAt) >= DISCOUNT_TIME) {
      order.discountApplied = true;
    }
    // Mark the order as fulfilled and save it in the database
    order.status = "Fulfilled";
    await order.save();
    // Send a notification to the customer to refresh their page
    req.io.emit("customer message", order.customerID);
    return res.status(200).send("Order has been fulfilled.");
  } catch (err) {
    // Error occurred during saving
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// Mark an order as picked up
const markPickedUp = async (req, res) => {
  try {
    // Search for the order from the database
    const order = await Order.findOne({
      vendorID: req.user._id,
      orderNumber: req.params.orderNumber,
    });
    // Order not found in database
    if (order === null) {
      req.flash("updateMessage", "Order does not exist.");
      return res
        .status(400)
        .send("Sorry, we could not find the order in our database.");
    }
    // Order has already been cancelled or not ready yet
    if (order.status != "Fulfilled") {
      req.flash("updateMessage", "Order could not be picked up.");
      return res.status(400).send("Sorry, the order could not be picked up.");
    }
    // Mark an order as picked up and save it in the database
    order.status = "Picked-Up";
    await order.save();
    return res.status(200).send("Order has been picked up.");
  } catch (err) {
    // Error occurred during saving
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// Export the controller functions
module.exports = {
  getFrontPage,
  getOrders,
  getOrderByNumber,
  getOrderHistory,
  markFulfilled,
  markPickedUp,
  viewOrderList,
  viewLocation,
};
