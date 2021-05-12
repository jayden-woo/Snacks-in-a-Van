const mongoose = require("mongoose")

// import the models used
const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")
const User = mongoose.model("User")

// TODO: IMPLEMET LOGIN


// get all the vendors currently in the database
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find( {}, {_id: false} )
        return res.send(vendors)
    } catch (err) {
        return res.status(400).json({error: "Database query failed"})
    }
}

// get the current status of a vendor 
const getVendorByUserID = async (req, res) => {
    try {
        const vendor = await Vendor.findOne( {"userID": req.params.userID} , {_id: false})
        // no vendor was found in database
        if (vendor === null) { 
            return res.status(404).json({error: "Vendor not found"})
        }
        return res.status(200).send(vendor)
    } catch (err) { 
        return res.status(400).json({error: "Database query failed"})
    }
}

// get a list of all the outstanding orders of a vendor
// need to change order schema?
const getOutstandingOrders = async (req, res) => {
    try {
        // find the list of outstanding orders of a vendor and send it back
        const OutstandingOrders = await Order.find( {"vendorID": req.params.vendorID, $or:[{"status": "Cooking"}, {"status": "Ordering"}, {"status": "Fulfilled"}]} )
        res.send(OutstandingOrders)
    // error occurred during the database query
    } catch (err) {
        res.status(400)
        res.send("Database query failed")
    }
}

// get order information using orderID
const getVendorOrderDetails = async (req, res) => {
    try {
        // use vendorID and orderID to get details
        // use order models to look for the order
        const vendorOrderDetails = await Order.find( {"vendorID": req.params.vendorID, "orderNumber": req.params.orderID} )
        res.send(vendorOrderDetails)
    } catch (err) {  
        res.status(400)
        res.send("No order found")
    }
}

// add a new vendor
const addVendor = async (req, res) => {
    // construct a new vendor object from body of the POST request
    const vendor = await new Vendor(req.body)
    // save the new vendor to the vendors database
    vendor.save( (err, result) => {
        // error occured during saving of a new vendor
        if (err) res.send(err)
        // send back vendor details for checking
        res.send(result)
    })
}


// update the status of a vendor
const updateVendor = async (req, res) => {
    const {isOnline, latitude, longitude, textAddress} = req.body
    try {
        // change the status if it is in the request body
        if ("isOnline" in req.body){
            console.log("Changing isOnline to :", isOnline)
            await Vendor.updateOne({userID: req.session.user._id}, {isOnline: isOnline}) 
        }
        // change the location of the vendor's van if it is in the request body
        if (latitude && longitude) {
            console.log("Changing location to :",latitude, longitude)
            await Vendor.updateOne({userID: req.session.user._id}, {latitude:latitude, longitude:longitude}) 
        }
        if(textAddress) {
            console.log("Changing text address to: ", textAddress)
            await Vendor.updateOne({userID: req.session.user._id}, {textAddress: textAddress}) 
        }
        // send back vendor details for checking
        res.status(200).send(await Vendor.findOne({userID: req.session.user._id}))
    // error occurred during the database update
    } catch (err) {
        res.status(400).json({error: "Database update failed"})
    }
}

// update the status of a current order
const updateOrderStatus = async (req, res) => {
    try {
        if (req.body.status) {
            // change the status of the order 
            console.log("Changing status to", req.body.status)
            await Order.updateOne( {orderNumber: req.params.orderNum}, {status: req.body.status} )
            res.send("Changed Order "+req.params.orderNum+"'s status to "+req.body.status)
        }
    }
    // error occurred during the database update
    catch (err) {
        res.status(400) 
        res.send("Database update failed")
    }
}

// remember to export the functions
module.exports = {
    getAllVendors, 
    getVendorByUserID, 
    getOutstandingOrders, 
    //addVendor, 
    updateVendor, 
    updateOrderStatus,
    getVendorOrderDetails
}
