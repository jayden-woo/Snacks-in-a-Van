const mongoose = require("mongoose")

// import the models used
const Customer = mongoose.model("Customer")
const Snack = mongoose.model("Snack")
const Order = mongoose.model("Order")
const Vendor = mongoose.model("Vendor")

// global constants to be tweaked in the future if needed
// time limit to give a discount for orders (15 mins)
const DISCOUNT_TIME = 15 * 60 * 1000

// get the front page for a vendor
const getFrontPage = (req, res) => {
    return res.status(200).redirect("/vendor/order")
}

// get all the outstanding order details
const getOrders = (req, res) => {
    Order.aggregate()
        .match({
            vendorID: req.user._id, 
            status: { $in: ["Placed", "Fulfilled"] }
        }).lookup({
            from: "customers", 
            localField: "customerID", 
            foreignField: "_id", 
            as: "customerID"
        }).unwind(
            "customerID"
        ).lookup({
            from: "snacks", 
            localField: "snacks.snackID", 
            foreignField: "_id", 
            as: "snacks"
        }).project({
            _id: 0, 
            customerID: {
                _id: 0, 
                email: 0, 
                password: 0, 
                lastName: 0, 
                createdAt: 0, 
                updatedAt: 0,
                __v: 0
            }
        // add the duration left before discount need to be applied (in milliseconds)
        }).addFields({
            duration: {
                $subtract: [
                    DISCOUNT_TIME, 
                    { $subtract: [
                        "$$NOW", 
                        "$updatedAt"
                    ] }
                ]
            }
        // sort by oldest order first then "placed" order before "fulfilled"
        }).sort({
            updatedAt: "asc", 
            status: "desc"
        })
        .exec( (err, result) => {
            if (err) {
                return res.status(400).send("Oops! Something went wrong.")
            }
            // don't need to use lean as pipeline output is already js object
            return res.status(200).send(result)
        })
}

//
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order
            .findOne({
                vendorID: req.user._id, 
                orderNumber: req.params.orderNumber
            }).populate({
                path: "customerID", 
                select: "firstName"
            }).populate({
                path: "snacks.snackID"
            }).lean()
        order.duration = DISCOUNT_TIME - (new Date() - new Date(order.updatedAt))
        return res.status(200).send(order)
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

//
const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order
            .find({
                vendorID: req.user._id, status: {$in: ["Picked-Up", "Cancelled"]}
            }).populate({
                path: "customerID", 
                select: "firstName"
            }).populate({
                path: "snacks.snackID"
            // sort by newest order first
            }).sort({
                updatedAt: -1
            }).lean()
        return res.status(200).send(orders)
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}


// // TEMP create 10 vendors with random locations and ids
// // create random mongoIDs
// const mongoObjectId = function () {
//     var timestamp = (new Date().getTime() / 1000 | 0).toString(16)
//     return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
//         return (Math.random() * 16 | 0).toString(16);
//     }).toLowerCase()
// }
// const addVendor = async (req, res) => {
//     const coordinates = [
//         [144.953552, -37.816904],   // Location 1
//         [144.967131, -37.817651],   //          2
//         [144.960535, -37.802159],   //          3
//         [144.956983, -37.813893],   //          4
//         [144.955188, -37.808538],   //          5
//         [144.960482, -37.804329],   //          6
//         [144.962324, -37.799144],   //          7
//         [144.970075, -37.785843],   //          8
//         [144.987312, -37.790795],   //          9
//         [144.971927, -37.811552]    //          10
//     ]
//     for (let i=1; i<=10; i++) {
//         let vendor = new Vendor({
//             userID: mongoObjectId(), 
//             isOnline: [3,6,9].includes(i) ? false : true, 
//             location: {
//                 coordinates: coordinates[i-1]
//             }, 
//             textAddress: "Location " + i
//         })
//         vendor.save( (err) => {
//             if (err) throw err;
//         })
//     }
//     return res.send(await Vendor.find())
// }


//
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
        order.status = "Fulfilled"
        await order.save()
        return res.status(200).send("Order has been fulfilled.")
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

//
const markPickedUp = async (req, res) => {
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
        // order has already been cancelled or not ready yet
        if (order.status != "Fulfilled") {
            req.flash("updateMessage", "Order could not be picked up.")
            return res.status(400).send("Sorry, the order could not be picked up.")
        }
        order.status = "Picked-Up"
        await order.save()
        return res.status(200).send("Order has been picked up.")
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// remember to export the functions
module.exports = {
    getFrontPage,
    getOrders, 
    getOrderByNumber, 
    getOrderHistory, 
    // addVendor, 
    markFulfilled,
    markPickedUp
}
