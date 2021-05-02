const express = require('express')

// add the vendor router 
const vendorRouter = express.Router()

// add the checking middleware
const isLoggedIn = require('../middleware/isLoggedIn')

// add the vendor controller
const vendorController = require('../controllers/vendorController.js')

// handle the GET requests for one or all the vendors
vendorRouter.get('/', vendorController.getAllVendors)

// havent test
//vendorRouter.get('/:userName', vendorController.getVendorByUsername)

// handle the GET request for the status of a vendor
// havent test
vendorRouter.get('/:userName/status', vendorController.getVendorStatus)

// handle the GET request for the outstanding orders of a vendor
// required login, use session
vendorRouter.get('/:vendorName/outstanding', vendorController.getOutstandingOrders)


// handle the POST request to add a new vendor
//vendorRouter.post('/', vendorController.addVendor)

// handle the POST request to update the status of a vendor
// havent tested yet
//vendorRouter.post('/account', isLoggedIn, vendorController.updateVendor)

// handle the POST request to update the status of an order
// havent test
vendorRouter.post('/orders/:orderNum', isLoggedIn, vendorController.updateOrderStatus)

// export the router
module.exports = vendorRouter 
