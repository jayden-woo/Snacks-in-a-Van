const mongoose = require("mongoose")
const Order = mongoose.model("Order")

// check if passed ten minutes
const timeLimit = async (req, res, next) => {
    const order = await Order.findOne({_id: req.body.orderId})
    const now = new Date();
    const creatTime = new Date(order.updatedAt) // order.createdAt is a UTC time
    var diff = (now - creatTime) / (60 * 1000);
    if (order.status === 'Fulfilled') {
        req.session.response.success = false
        req.session.response.errors.push('This order is fullfilled already')
        req.session.save()
        return res.status(408).json(req.session.response)
    }
    else if (diff >= 10.0)  {
        req.session.response.success = false
        req.session.response.errors.push('Already passed 10 min, order can not be modified')
        req.session.save()
        return res.status(408).json(req.session.response)
    }
    return next()
}

// export the function
module.exports = timeLimit
