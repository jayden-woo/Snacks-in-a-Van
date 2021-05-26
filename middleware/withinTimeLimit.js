const mongoose = require("mongoose")
const Order = mongoose.model("Order")

// global constants to be tweaked in the future if needed
// time limit for changing or cancelling order (10 mins) 
const TIME_LIMIT = 10 * 60 * 1000

// check if the order is still within the time limit
const withinTimeLimit = async (req, res, next) => {
    // find the order from database
    const order = await Order.findOne( {_id: req.body.orderId} )
    // calculate the time passed since last updated
    const diff = new Date() - new Date(order.updatedAt)
    // find the redirect url if the order can't be modified
    const urlSections = req.orginalUrl.split()
    const redirectUrl = `/${urlSections[1]}/${urlSections[2]}/${urlSections[3]}`
    // check if the order has been fulfilled
    if (order.status === 'Fulfilled') {
        req.flash("Your order has been fullfilled already.")
        return res.status(408).redirect(redirectUrl)
    }
    // check if the order has passed the time limit
    if (diff >= TIME_LIMIT)  {
        req.flash(`Your order has already passed ${TIME_LIMIT/60/1000} mins and cannot be modified.`)
        return res.status(408).redirect(redirectUrl)
    }
    return next()
}

// export the function
module.exports = withinTimeLimit
