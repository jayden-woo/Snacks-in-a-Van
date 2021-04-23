const express = require('express')

// add the vendor router 
const vendorRouter = express.Router()

// add the vendor controller
const vendorController = require('../controllers/vendorController.js')

// GET requests for the vendor
vendorRouter.get('/login', (req, res) => vendorController.login(req, res))
vendorRouter.get('/:vendorId/status',(req, res) =>vendorController.vendorStatus(req, res))
vendorRouter.get('/:vendorId/outstanding',(req, res) => vendorController.getOutstandingOrders(req, res))
vendorRouter.get('/:vendorId',(req, res) =>vendorController.getOneVendor(req, res))
vendorRouter.get('/', (req, res) => vendorController.getAllVendors(req, res))

// POST requests for the vendor
vendorRouter.post('/:vendorId/', (req, res) => vendorController.updateVendor(req, res))
vendorRouter.post('/', (req, res) => vendorController.addVendor(req, res))
vendorRouter.post('/orders/:orderId', (req, res) => vendorController.updateOrderStatus(req, res))

// export the router
module.exports = vendorRouter 
