const mongoose = require("mongoose");
const Order = mongoose.model("Order");

// Time limit for changing or cancelling order (10 mins)
const TIME_LIMIT = 10 * 60 * 1000;

// Check if the order is still within the time limit
const withinTimeLimit = async (req, res, next) => {
  // Find the order from database
  const order = await Order.findById(req.body.orderId);
  // Calculate the time passed since last updated
  const diff = new Date() - new Date(order.updatedAt);
  // Check if the order has been fulfilled or picked-up or cancelled
  if (
    order.status === "Fulfilled" ||
    order.status === "Picked-Up" ||
    order.status === "Cancelled"
  ) {
    return res.status(408).json({
      success: false,
      message: [
        `Your order has already been ${order.status.toLowerCase()} and cannot be modified any more.`,
      ],
    });
  }
  // Check if the order has passed the time limit
  if (diff >= TIME_LIMIT) {
    return res.status(408).json({
      success: false,
      message: [
        `Your order has already passed ${
          TIME_LIMIT / 60 / 1000
        } mins and cannot be modified any more.`,
      ],
    });
  }
  return next();
};

// Export the function
module.exports = withinTimeLimit;
