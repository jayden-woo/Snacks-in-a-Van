const express = require('express')

// add the vendor router 
const vendorRouter = express.Router()

// add the vendor controller
const vendorController = require('../controllers/vendorController.js')

// handle the GET requests for one or all the vendors
vendorRouter.get('/', (req, res) => vendorController.getAllVendors(req, res))
vendorRouter.get('/:vendorName',(req, res) =>vendorController.getVendorByName(req, res))

// handle the GET request for the status of a vendor
vendorRouter.get('/:vendorName/status',(req, res) =>vendorController.getVendorStatus(req, res))

// handle the GET request for the outstanding orders of a vendor
vendorRouter.get('/:vendorName/outstanding',(req, res) => vendorController.getOutstandingOrders(req, res))

// handle the POST request to add a new vendor
vendorRouter.post('/', (req, res) => vendorController.addVendor(req, res))

// handle the POST request to update the status of a vendor
vendorRouter.post('/:vendorName/', (req, res) => vendorController.updateVendor(req, res))

// handle the POST request to update the status of an order
vendorRouter.post('/orders/:orderNum', (req, res) => vendorController.updateOrderStatus(req, res))

// export the router
module.exports = vendorRouter 
