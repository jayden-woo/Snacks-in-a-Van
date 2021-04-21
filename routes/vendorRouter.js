const express = require('express')
// add the customer router 
const vendorRouter = express.Router()

const vendorController = require('../controllers/vendorController.js')

// add the customer controller



//GET
vendorRouter.get('/login', (req, res) => vendorController.login(req, res))
vendorRouter.get('/status/:id',(req, res) =>vendorController.vendorStatus(req, res))
vendorRouter.get('/orders/:id',(req, res) => vendorController.getOutstandingOrders(req, res))
vendorRouter.get('/:id',(req, res) =>vendorController.getOneVendor(req, res))
vendorRouter.get('/', (req, res) => vendorController.getAllVendors(req, res))


//POST
vendorRouter.post(':id/', (req, res) => vendorController.updateVendor(req, res))
vendorRouter.post('/', (req, res) => vendorController.addVendor(req, res))




// export the router
module.exports = vendorRouter 