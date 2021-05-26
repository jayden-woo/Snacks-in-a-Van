const mongoose = require("mongoose")

// import the models used
const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")

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


// // add a new vendor
// const addVendor = async (req, res) => {
//     // construct a new vendor object from body of the POST request
//     const vendor = await new Vendor(req.body)
//     // save the new vendor to the vendors database
//     vendor.save( (err, result) => {
//         // error occured during saving of a new vendor
//         if (err) res.send(err)
//         // send back vendor details for checking
//         res.send(result)
//     })
// }


// TEMP create 10 vendors with random locations and ids
// create random mongoIDs
const mongoObjectId = function () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16)
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase()
}
const addVendor = async (req, res) => {
    const coordinates = [
        [144.953552, -37.816904],   // Location 1
        [144.967131, -37.817651],   //          2
        [144.960535, -37.802159],   //          3
        [144.956983, -37.813893],   //          4
        [144.955188, -37.808538],   //          5
        [144.960482, -37.804329],   //          6
        [144.962324, -37.799144],   //          7
        [144.970075, -37.785843],   //          8
        [144.987312, -37.790795],   //          9
        [144.971927, -37.811552]    //          10
    ]
    for (let i=1; i<=10; i++) {
        let vendor = new Vendor({
            userID: mongoObjectId(), 
            isOnline: [3,6,9].includes(i) ? false : true, 
            location: {
                coordinates: coordinates[i-1]
            }, 
            textAddress: "Location " + i
        })
        vendor.save( (err) => {
            if (err) throw err;
        })
    }
    return res.send(await Vendor.find())
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
    addVendor, 
    updateVendor, 
    updateOrderStatus
}
