const express = require('express')

// add the customer router 
const vendorRouter = express.Router()

// add the customer controller
const vendorController = require('../controllers/vendorController.js')


//GET
vendorRouter.get('/vendor/login', vendorController.login(req, res))
vendorRouter.get('/vendor/:id/status',vendorController.vendorStatus(req, res))
vendorRouter.get('/vendor/:id/orders', vendorController.getOutstandingOrders(req, res))
//POST
vendorRouter.post('vendor/:id/update', vendorController.updateVendor(req, res))
vendorRouter.post('vendor/update/:orderid', vendorController.updateOrder(req, res))
vendorRouter.post('vendor/add', addVendor(req, res))
// export the router
module.exports = vendorRouter
