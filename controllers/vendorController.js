const mongoose = require("mongoose");

// import the models used
const Order = mongoose.model("Order");

const dayjs = require("dayjs"); // foramt time

// global constants to be tweaked in the future if needed
// time limit to give a discount for orders (15 mins)
const DISCOUNT_TIME = 15 * 60 * 1000;

// get the front page for a vendor
const getFrontPage = (req, res) => {
    return res.status(200).redirect("/vendor/order");
};

// get all the outstanding order details
const getOrders = (req, res) => {
  Order.aggregate()
    // find the outstanding orders associated with the current vendor
    .match({
        vendorID: req.user._id,
        status: { $in: ["Placed", "Fulfilled"] },
        // add the customer given name
    })
    .lookup({
        from: "customers",
        localField: "customerID",
        foreignField: "_id",
        as: "customerID",
        // unpack it from an array of one item
    })
    .unwind(
        "customerID"
        // add the snack details
    )
    .lookup({
        from: "snacks",
        localField: "snacks.snackID",
        foreignField: "_id",
        as: "snacks",
        // remove unnecessary fields
    })
    .project({
        //   _id: 0,  // Required for order details page
        customerID: {
            _id: 0,
            email: 0,
            password: 0,
            lastName: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
      },
    // add the duration left before discount must be given (in milliseconds)
    })
    .addFields({
        duration: {
            $subtract: [DISCOUNT_TIME, { $subtract: ["$$NOW", "$updatedAt"] }],
        },
    // sort by oldest order first then "placed" order comes before "fulfilled"
    })
    .sort({
        updatedAt: "asc",
        status: "desc",
    })
    // execute the pipeline
    .exec((err, result) => {
        if (err) {
            return res.status(400).send("Oops! Something went wrong.");
        }
        // don't need to use lean as pipeline output is already js object
        return res.status(200).send(result);
    });
};

// Order list view rendering
const viewOrderList = (req, res) => {
    return res.status(200).render("vendor/order");
};

// Order list view rendering
const viewLocation = (req, res) => {
    return res.status(200).render("vendor/location");
};

// get details of one order by its order number
const getOrderByNumber = async (req, res) => {
    try {
        let order = await Order
        // find the given order that is associated with the current vendor
        .findOne({
            vendorID: req.user._id,
            orderNumber: req.params.orderNumber,
            // add the customer given name
        })
        .populate({
            path: "customerID",
            select: "firstName",
            // add the snack details
        })
        .populate({
            path: "snacks.snackID",
            // convert to a js object
        })
        .lean();
        // add the duration left before discount must be given (in milliseconds)
        order.duration = DISCOUNT_TIME - (new Date() - new Date(order.updatedAt));
        // Format the date to 11:00 am format
        order.pickedUpTime = dayjs(
        new Date(order.updatedAt).getTime() + DISCOUNT_TIME
        ).format("hh:mm a");

        order.discountPrice = order.duration <= 0 ? order.total * 0.8 : order.total;

        return res.status(200).send(order);
        // error occurred during query
    } catch (err) {
        console.log("getOrderByNumber err", err);
        return res.status(400).send("Oops! Something went wrong.");
    }
};

// get the order history with picked-up and cancelled orders
const getOrderHistory = async (req, res) => {
    try {
        // check if there's any orders
        const list = await Order
            .find({
                vendorID: req.user._id, 
                status: "Picked-Up"
            }).limit(1)
        if (!list.length) {
            return res.status(200).send([])
        }
        const orders = await Order
            // find the previous orders associated with the current vendor
            .find({
                vendorID: req.user._id, status: "Picked-Up"
            // add the customer given name
            }).populate({
                path: "customerID", 
                select: "firstName"
            // add the snack details
            }).populate({
                path: "snacks.snackID"
            // sort by newest order first
            }).sort({
                updatedAt: -1
            // convert to a js object
            }).lean()
        return res.status(200).send(orders)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.");
    }
};

// mark an order as fulfilled and apply discount if time limit passed
const markFulfilled = async (req, res) => {
    try {
        // search for the order from the database
        const order = await Order.findOne({
            vendorID: req.user._id, 
            orderNumber: req.params.orderNumber
        })
        // order not found in database
        if (order === null) {
            req.flash("updateMessage", "Order does not exist.")
            return res.status(400).send("Sorry, we could not find the order in our database.")
        }
        // order has already been fulfilled or cancelled
        if (order.status != "Placed") {
            req.flash("updateMessage", "Order could not be fulfilled.")
            return res.status(400).send("Sorry, the order could not be fulfilled.")
        }
        // check if the time limit for discount has passed
        if ((new Date() - new Date(order.updatedAt)) >= DISCOUNT_TIME) {
            order.discountApplied = true
        }
        // mark the order as fulfilled and save it in the database
        order.status = "Fulfilled"
        await order.save()
        // send a notification to the customer to refresh their page
        req.io.emit('customer message', order.customerID)
        return res.status(200).send("Order has been fulfilled.")
    // error occurred during saving
    } catch (err) {
        console.log("markFulfilled", err);
        return res.status(400).send("Oops! Something went wrong.");
    }
};

// mark an order as picked up
const markPickedUp = async (req, res) => {
  try {
    // search for the order from the database
    const order = await Order.findOne({
      vendorID: req.user._id,
      orderNumber: req.params.orderNumber,
    });
    // order not found in database
    if (order === null) {
      req.flash("updateMessage", "Order does not exist.");
      return res
        .status(400)
        .send("Sorry, we could not find the order in our database.");
    }
    // order has already been cancelled or not ready yet
    if (order.status != "Fulfilled") {
      req.flash("updateMessage", "Order could not be picked up.");
      return res.status(400).send("Sorry, the order could not be picked up.");
    }
    // mark an order as picked up and save it in the database
    order.status = "Picked-Up";
    await order.save();
    return res.status(200).send("Order has been picked up.");
    // error occurred during saving
  } catch (err) {
    return res.status(400).send("Oops! Something went wrong.");
  }
};

// export the controller functions
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
