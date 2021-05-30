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

// get the frontpage
const getFrontPage = (req, res) => {
    return res.status(200).render("customer/homepage")
}

// get a list of the closest vendors
const getVendorsList = (req, res) => {    
    Vendor.aggregate([
        { 
            $geoNear: {
                near: req.session.location, 
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
            console.log(err)
            return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
        }
        // convert the distance to km and round to 3 decimal places
        result.map( (vendor) => {
            vendor.distance = (vendor.distance/1000).toFixed(3)
        })
        // don't need to use lean as pipeline output is already js object
        return res.status(200).render("customer/map", {vendors: result})
    })
}

// get a list of the closest vendors
const getVendorsListApi = (req, res) => {    
    Vendor.aggregate([
        { 
            $geoNear: {
                near: req.session.location, 
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
            console.log(err)
            return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
        }
        // convert the distance to km and round to 3 decimal places
        result.map( (vendor) => {
            vendor.distance = (vendor.distance/1000).toFixed(3)
        })
        // don't need to use lean as pipeline output is already js object
        return res.status(200).json({success: true, vendors: result})
    })
}

// get the menu from database
const getMenu = async (req, res) => {
    try {
        const menu = await Snack.find().lean()
        // render the menu page
        return res.status(200).render("customer/menu", {list: menu})
    // error occurred during query
    } catch (err) {
        return res.status(400).render("error", {code: 400, message: "Oops! Something went wrong."})
    }
}

// get details of one snack from database by its name
const getSnackByName = async (req, res) => {
    try {
        // search for a snack by name
        const snack = await Snack.findOne({ name: req.params.snackName }).lean()
        // snack not found in database
        if (snack === null) { 
            return res.status(404).render("error", {code: 404, message: "Oops! Snack not found."})
        }
        // render the snack details page
        return res.status(200).render("customer/oneSnack", {oneSnack: snack, user: req.user })
    // error occurred during query
    } catch (err) {
        return res.status(400).render("error", {code: 400, message: "Oops! Something went wrong."})
    }
}

// render the cart page for the client
const getCart = (req, res) => {
    return res.status(200).render("customer/cart", {user: req.user})
}

// get all the orders details
const getOrders = async (req, res) => {
    try {
        // check if there's any orders
        const list = await Order.find({ customerID: req.user._id }).limit(1)
        console.log(list)
        if (!list.length) {
            console.log("HERE")
            return res.status(200).render("customer/order", {order: [], user: JSON.stringify(req.user)})
        }
        const orders = await Order
            // find orders associated with the current customer
            .find({
                customerID: req.user._id
            // add the vendor van name
            }).populate({
                path: "vendorID",
                select: "username"
            // add the snack details
            }).populate({
                path: "snacks.snackID"
            // sort by newest order first
            }).sort({
                updatedAt: -1
            // convert to a js object
            }).lean()
        return res.status(200).render("customer/order", {order: orders, user: JSON.stringify(req.user)})
    // error occurred during query
    } catch (err) {
        console.log(err)
        return res.status(400).render("error", {code: 400, message: "Oops! Something went wrong."})
    }
}

// get details of one order by its order number
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order
            // find the given order that is associated with the current customer
            .findOne({
                customerID: req.user._id, 
                orderNumber: req.params.orderNumber
            // add the vendor van name
            }).populate({
                path: "vendorID",
                select: "username"
            // add the snack details
            }).populate({
                path: "snacks.snackID"
            // convert to a js object
            }).lean()
        return res.status(200).send(order)
    // error occurred during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// render the feedback page for the client
const getFeedback = (req, res) => {
    return res.status(200).render("customer/feedback", {id: req.query._id, number: req.query.number})
}

// save the location of the customer in session
const saveLocation = (req, res) => {
    try {
        req.session.location = {
            type: "Point", 
            coordinates: [Number(req.body.longitude), Number(req.body.latitude)]
        }
        return res.status(200).json({success: true, message: ["Your location has been successfully captured."]})
    } catch (err) {
        return res.status(500).json({success: false, message: ["Oops! Something went wrong. Please try again later."]})
    }
}

// select a vendor to start the order from
const selectVendor = async (req, res) => {
    try {
        // search for the vendor
        const vendor = await Vendor.findById(req.body._id)
        // vendor not found in database
        if (vendor === null) {
            return res.status(404).json({success: false, message: ["Oops! Vendor not found."]})
        }
        // store the vendor in session to be added during order confirmation
        req.session.vendor = vendor
        return res.status(200).json({success: true, message: ["Vendor selected."]})
    // error occurred during query
    } catch (err) {
        return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
    }
}

// confirm the current order selections
const confirmOrder = async (req, res) => {
    try {
        // create a list containing all the snacks and quantity
        const orderlist = req.body.orderlist;
        const lineItems = []
        for (i=0; i<orderlist.length; i++) {
            lineItems.push(
                new OrderLine({
                    snackID: orderlist[i].snackId,
                    quantity: parseInt(orderlist[i].quantity)
                })
            )
        }
        // construct a new order and save it to database
        const orderNumber = await Order.countDocuments()
        const order = new Order({
            orderNumber: orderNumber, 
            vendorID: req.body.vendorId || req.session.vendor._id,
            customerID: req.user._id, 
            snacks: lineItems, 
            total: parseFloat(req.body.price)
        })
        await order.save()
        // send a notification to the vendor to refresh their page
        req.io.emit('vendor message', order.vendorID)
        return req.res.status(200).json({success: true, message: ["Order placed successfully."]})
    // error occurred during saving
    } catch {
        return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
    }
}

// update the previously confirmed order with new items or quantities
const updateOrder = async (req, res) => {
    try {
        // find the order from the database
        const order = await Order.findOne({
            _id: req.body.orderId, 
            customerID: req.user._id
        })
        // order not found in database
        if (order === null) {
            return res.status(404).json({success: false, message: ["Oops! Order not found."]})
        }
        // create a new list containing all the snacks and quantity
        const orderlist = req.body.orderlist;
        const lineItems = []
        for (i=0; i<orderlist.length; i++) {
            lineItems.push(new OrderLine({
                snackID: orderlist[i].snackId, 
                quantity: parseInt(orderlist[i].quantity)
            }))
        }
        // change the items and the price in the order and save it
        order.snacks = lineItems
        order.total = parseFloat(req.body.newPrice)
        await order.save()
        // send a notification to the vendor to refresh their page
        req.io.emit('vendor message', order.vendorID)
        return res.status(200).json({success: true, message: ["Your order has been successfully updated."]});
    // error occurred during saving
    } catch (err) {
        return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
    }
}

// cancel an order by changing its status
const cancelOrder = async (req, res) => {
    try {
        // find the order from the database
        const order = await Order.findOne({
            _id: req.body.orderId, 
            customerID: req.user._id
        })
        // snack not found in database
        if (order === null) {
            return res.status(404).json({success: false, message: ["Order does not exist."]})
        }
        // change the order status to "cancelled" and save it
        order.status = "Cancelled"
        await order.save()
        // send a notification to the vendor to refresh their page
        req.io.emit('vendor message', order.vendorID)
        return res.status(200).json({success: true, message: ["Order has been successfully cancelled."]})
    // error occurred during saving
    } catch (err) {
        return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
    }
}

// submit a feedback for a previous order
const submitFeedback = async (req, res) => {
    try {
        // construct a new feedback for the order
        const feedback = new Feedback({
            rating: req.body.rating, 
            comment: req.body.comment
        })
        // search for the order to place the feedback in
        const order = await Order.findOne({
            _id: req.body._id, 
            customerID: req.user._id, 
        })
        // order not found in database
        if (order === null) {
            return res.status(404).send("Order not found.")
        }
        // add the feedback to the order and save it
        order.feedback = feedback
        await order.save()
        return res.status(200).json({success: true, message: ["Feedback has been successfully added for your order."]})
    // error occured during saving
    } catch (err) {
        return res.status(400).json({success: false, message: ["Oops! Something went wrong."]})
    }
}

// export the controller functions
module.exports = {
    getFrontPage, 
    getVendorsList, 
    getVendorsListApi,
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
    submitFeedback
}
