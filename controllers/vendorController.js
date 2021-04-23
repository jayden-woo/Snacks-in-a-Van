const mongoose = require("mongoose")

// import the models used
const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")

// TODO: IMPLEMET LOGIN

// get all the vendors currently in the database
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find( {}, {_id: false} )
        res.send(vendors)
    } catch (err) {
        res.status(400)
        res.send("Database query failed")
    }
}

// get a vendor by their unique name
const getVendorByName = async (req, res) => {
    try {
        const vendor = await Vendor.findOne( {"vendorName": req.params.vendorName} )
        // no vendor was found in database
        if (vendor === null) { 
            res.status(404)
            return res.send("Vendor not found")
        }
        res.status(200);
        // send back the vendor details
        res.send(vendor)
    // error occurred during the database query
    } catch (err) { 
        res.status(400)
        res.send("Database query failed")
    }
}

// get the current status of a vendor 
const getVendorStatus = async (req, res) => {
    try {
        const vendors = await Vendor.findOne( {"vendorName": req.params.vendorName} )
        // no vendor was found in the database
        if (!vendors) {res.send("Vendor: "+req.params.vendorName+" Not Found")}
        // extract the required details for the status and send it back
        const status = {
            "isOnline": vendors.isOnline,
            "location": [vendors.latitude, vendors.longitude]
        }
        res.send(status)
    } catch (err) {
        console.error(err)
        res.status(400)
        res.send("Database query failed")
    }
}

// get a list of all the outstanding orders of a vendor
const getOutstandingOrders = async (req, res) => {
    try {
        // find the list of outstanding orders of a vendor and send it back
        const OutstandingOrders = await Order.find( {"vendorName": req.params.vendorName, "status": "Cooking"} )
        res.send(OutstandingOrders)
    // error occurred during the database query
    } catch (err) {
        res.status(400)
        res.send("Database query failed")
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
    try {
        // change the status if it is in the request body
        if ("isOnline" in req.body){
            console.log("Changing status to",req.body.isOnline)
            await Vendor.updateOne( {vendorName:req.params.vendorName}, {isOnline:req.body.isOnline} ) 
        }
        // change the location of the vendor's van if it is in the request body
        if ("latitude" in req.body && "longitude" in req.body) {
            console.log("Changing location to",req.body.latitude, req.body.longitude)
            await Vendor.updateOne( {vendorName:req.params.vendorName}, {latitude:req.body.latitude, longitude:req.body.longitude} ) 
        }
        // send back vendor details for checking
        res.send(await Vendor.findOne( {vendorName:req.params.vendorName}, {} ))
    // error occurred during the database update
    } catch (err) {
        res.status(400)
        res.send("Database update failed")
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
    getVendorByName, 
    getVendorStatus, 
    getOutstandingOrders, 
    addVendor, 
    updateVendor, 
    updateOrderStatus
}
