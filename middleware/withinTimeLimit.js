const mongoose = require("mongoose")
const Order = mongoose.model("Order")

// global constants to be tweaked in the future if needed
// time limit for changing or cancelling order (10 mins) 
const TIME_LIMIT = 10 * 60 * 1000

// check if the order is still within the time limit
const withinTimeLimit = async (req, res, next) => {
    // find the order from database
    const order = await Order.findById(req.body.orderId)
    // calculate the time passed since last updated
    const diff = new Date() - new Date(order.updatedAt)
    // check if the order has been fulfilled or picked-up or cancelled
    if (order.status === 'Fulfilled' || order.status === 'Picked-Up' || order.status === 'Cancelled') {
        return res.status(408).json({success: false, message: [`Your order has already been ${order.status.toLowerCase()} and cannot be modified anymore.`]})
    }
    // check if the order has passed the time limit
    if (diff >= TIME_LIMIT)  {
        return res.status(408).json({sucess:false, message: [`Your order has already passed ${TIME_LIMIT/60/1000} mins and cannot be modified anymore.`]})
    }
    return next()
}

// export the function
module.exports = withinTimeLimit
