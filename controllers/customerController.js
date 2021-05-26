const mongoose = require("mongoose")

// import the models used
const Snack = mongoose.model("Snack")
const OrderLine = mongoose.model("OrderLine")
const Feedback = mongoose.model("Feedback")
const Order = mongoose.model("Order")
const Vendor = mongoose.model("Vendor")

// global constants to be tweaked in the future if needed
// number of vendors to be displayed
const N_VENDORS = 5

// get a list of the closest vendors
const getVendorsList = (req, res) => {
    Vendor.aggregate([
        { 
            $geoNear: {
                near: req.body.location, 
                distanceField: 'distance', 
                spherical: true, 
                query: { isOnline: true }
            }
        }, {
            $limit: N_VENDORS
        }
    ]).exec( (err, result) => {
        // error occured during query
        if (err) {
            return res.status(400).send("Oops! Something went wrong.")
        }
        // don't need to use lean as pipeline output is already js object
        return res.status(200).send(result)
    })
}

// get the menu from database
const getMenu = async (req, res) => {
    try {
        const menu = await Snack.find().lean()
        return res.status(200).send(menu)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// get details of one snack from database by its name
const getSnackByName = async (req, res) => {
    try {
        // search for a snack by name
        const snack = await Snack.findOne( {name: req.params.snackName} ).lean()
        // snack not found in database
        if (snack === null) { 
            return res.status(404).send("Oops! Snack not found.")
        }
        // send back snack details
        return res.status(200).send(snack)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

//
const getCart = (req, res) => {
    return res.status(200).send("<h1> Cart <\h1>")
}

// get all the orders details
const getOrders = async (req, res) => {
    try {
        const orders = await Order
            .find({
                customerID: req.user._id
            }).populate({
                path: "vendorID",
                select: "username"
            }).populate({
                path: "snacks.snackID"
            // sort by newest order first
            }).sort({
                updatedAt: -1
            }).lean()
        return res.status(200).send(orders)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// get details of one order by its order number
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order
            .findOne({
                customerID: req.user._id, 
                orderNumber: req.params.orderNumber
            }).populate({
                path: "vendorID",
                select: "username"
            }).populate({
                path: "snacks.snackID"
            }).lean()
        return res.status(200).send(order)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

//
const getFeedback = (req, res) => {
    return res.status(200).send("<h1> Feedback Page <\h1>")
}

// select a vendor to order from
const selectVendor = async (req, res) => {
    try {
        // search for the vendor
        const vendor = await Vendor.findOne({ userID: req.body.userID })
        // vendor not found in database
        if (vendor === null) {
            return res.status(404).send("Oops! Vendor not found.")
        }
        req.session.vendor = vendor
        return res.status(200).send("Vendor selected.")
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}


// confirm the current order selections
const confirmOrder = async (req, res) => {
    try {
        // check if a vendor has been selected before
        if (!req.session.vendor) {
            return res.status(422).send("Please chose a vendor first.")
        }
        // create a list containing all the snacks and quantity
        const orderList = req.body.orderList
        const lineItems = []
        for (i=0; i<req.body.list.length; i++) {
            lineItems.push(new OrderLine({
                snackID: orderList[i]._id, 
                quantity: orderList[i].quantity 
            }))
        }
        // construct a new order and save it to database
        const orderNumber = await Order.countDocuments()
        const order = new Order({
            orderNumber: orderNumber, 
            vendorID: req.session.vendor._id, 
            customerID: req.user._id, 
            snacks: lineItems, 
            total: req.body.price
        })
        await order.save()

        req.flash("orderMessage", "Order has been successfully placed.")
        return res.status(200).redirect("/customer/order")
    // error occurred during saving
    } catch {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

//
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            customerID: req.user._id, 
            orderNumber: req.params.orderNumber
        })
        // order not found in database
        if (order === null) {
            return res.status(404).send("Order does not exist.")
        }
        // create a new list containing all the snacks and quantity
        const orderList = req.body.orderList
        const lineItems = []
        for (i=0; i<req.body.list.length; i++) {
            lineItems.push(new OrderLine({
                snackID: orderList[i]._id, 
                quantity: orderList[i].quantity 
            }))
        }
        // change the items and the price in the order and save it
        order.snacks = lineItems
        order.total = req.body.price
        await order.save()

        req.flash("orderMessage", "Order successfully updated.")
        return res.status(200).send("Order has been successfully cancelled.")
    // error occurred during saving
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// cancel an order by changing its status
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            customerID: req.user._id, 
            orderNumber: req.params.orderNumber
        })
        // snack not found in database
        if (order === null) {
            return res.status(404).send("Order does not exist.")
        }
        // change the order status to cancelled and save it
        order.status = "Cancelled"
        await order.save()
        return res.status(200).send("Order has been successfully cancelled.")
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// 
const submitFeedback = async (req, res) => {
    try {
        // construct a new feedback for an order
        const feedback = new Feedback({
            rating: req.body.rating, 
            comment: req.body.comment
        })
        // search for the order to place the feedback for
        const order = await Order.findOne({
            customerID: req.user._id, 
            orderNumber: req.params.orderNumber
        })
        // order not found in database
        if (order === null) {
            return res.status(404).send("Order not found.")
        }
        // add the feedback to the order and save it
        order.feedback = feedback
        await order.save()
        return res.status(200).redirect("/customer/order")
    // error occured during saving
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// export the controller functions
module.exports = {
    getVendorsList, 
    getMenu, 
    getSnackByName, 
    getCart, 
    getOrders, 
    getOrderByNumber, 
    getFeedback, 
    selectVendor, 
    confirmOrder, 
    updateOrder, 
    cancelOrder, 
    submitFeedback
}
