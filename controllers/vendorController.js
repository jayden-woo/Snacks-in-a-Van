const Vendor = require('../models/vendor.js')
const {OrderLine, Order} = require('../models/order.js')
// get all Vendors
//TODO: IMPLEMET LOGIN

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
        const vendors = await Vendor.findOne( {"VendorId": req.params.VendorId} )
        return res.send(vendors.status)
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const oustandingOrders = async (req, res) => {
    try {
        const OutstandingOrders = await Order.find( {"VendorId": req.params.VendorId} )
        return (res.send(OutstandingOrders))
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

// find one Vendor by their id
const getOneVendor = async (req, res) => {
    try {
        const oneVendor = await Vendor.findOne( {"VendorId": req.params.VendorId})
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

const getOutstandingOrders = async (req, res) => {
    try {
        //incomplete orders
        const orders = await Order.find({'VendorID': req.params.VendorId} && {'status': 0})
        return res.send(orders)
    } catch(err) { // error occurred
        res.status(400)
        return res.send("Database query failed")
    }


}

const updateVendor = async (req, res) => {
    const new_Vendor = req.body   // construct changed Vendor object from body of POST
  
    try {
      const Vendor = await Vendor.findOne( {"VendorId": req.body.VendorId} )  // check that an Vendor with this Id already exists
      if (!Vendor) {    // if Vendor is not already in database, return an error
        res.status(400)
        return res.send("Vendor not found in database")
      }
  
      Object.assign(Vendor, new_Vendor)   // replace properties that are listed in the POST body
      let result = await Vendor.save()    // save updated Vendor to database
      res.status(200); //OK
      return res.send(result)             // return saved Vendor to sender
  
      } catch (err) {   // error detected
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
  


// remember to export the functions
module.exports = {
    getAllVendors,
    getOneVendor,
    vendorStatus,
    addVendor,
    updateVendor,
    getOutstandingOrders
}