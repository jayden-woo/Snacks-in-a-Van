const mongoose = require("mongoose")

const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")

//TODO: IMPLEMET LOGIN

// get all Vendors
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
        return res.send(vendors)
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const vendorStatus = async (req, res) => {
    try {
        const vendors = await Vendor.findOne( {"vendorID": req.params.id} )
        if (!vendors){res.send("Vendor: "+req.params.id+" Not Found")}
        const payload = {
            "status": vendors.isOnline,
            "location": [vendors.latitude, vendors.longitude]
        }
        return res.send(payload)
    } catch (err) {
        console.error(err);
        res.status(400)
        return res.send("Database query failed")
    }
}

const getOutstandingOrders = async (req, res) => {
    try {
        const OutstandingOrders = await Order.find( {"vendorID": req.params.id}, {"status" : "COOKING"} )
        return (res.send(OutstandingOrders))
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

// find one Vendor by their id
const getOneVendor = async (req, res) => {
    try {
        const oneVendor = await Vendor.findOne( {"vendorID": req.params.id})
        if (oneVendor === null) { // no Vendor found in database
            res.status(404)
            return res.send("Vendor not found")
        }
        res.status(200); //OK
        return res.send(oneVendor) // Vendor was found
    } catch (err) { // error occurred
        res.status(400)
        return res.send("Database query failed")
    }
}

const updateVendor = async (req, res) => {
    try {
        console.log("editing: "+req.params.id)   
        if (req.body.status){
        //change status 
            console.log("changing status",req.body.status)
            await Vendor.updateOne({vendorID:req.params.id}, {status:req.body.status}) 
        }
        if (req.body.latitude && req.body.longitude){
        //change location
            console.log("changing location to:",req.body.latitude,req.body.longitude)
            await Vendor.updateOne({vendorID:req.params.id}, {latitude:req.body.latitude, longitude:req.body.longitude}) 

        }
        res.status(200);
        res.send("success");
    // error detected
    } catch (err) {
        res.status(400)
        return res.send("Database update failed")
    }
}

// add an Vendor (POST)
const addVendor = async (req, res) => {
    const vendor = new Vendor(req.body)   // construct a new Vendor object from body of POST

    try {
        let result = await vendor.save()  // save new Vendor object to database
        res.status(200); //OK
        return res.send(result)           // return saved object to sender
    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database insert failed")
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        if (req.body.status) {
            //change status 
            console.log("changing status", req.body.status)
            await Order.updateOne( {orderNumber: req.params.orderId}, {status: req.body.status} )
            res.status(200) //OK 
            res.send("Changed Order "+req.params.orderId+"'s status to "+req.body.status)
        }
    }
    catch (err) {
            // error detected 
            res.status(400) 
            return res.send("Database update failed")
    }
}

// remember to export the functions
module.exports = {
    getAllVendors,
    getOneVendor,
    vendorStatus,
    addVendor,
    updateVendor,
    getOutstandingOrders, 
    updateOrderStatus
}
