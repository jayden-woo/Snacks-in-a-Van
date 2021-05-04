const mongoose = require("mongoose")
const Order = mongoose.model("Order")
const Customer = mongoose.model("Customer")

// rehydrate or get the current unfinished order from database if present
const getOrder = async (req, res, next) => {
    // hydrate previous order data into a Mongoose document
    if (req.session.order) {
        req.session.order = Order.hydrate(req.session.order)
        return next()
    }
    // check if a partially done order is present
    const customer = await Customer.findOne( {userID: req.session.user._id} )
    if (!req.session.order) {
        req.session.order = await Order.findOne( {customerID: customer._id, status: 'Ordering'} )
    }
    return next()
}

// export the function
module.exports = getOrder
