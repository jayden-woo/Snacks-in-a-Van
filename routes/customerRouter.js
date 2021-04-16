const express = require('express')

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// handle the GET request to get the menu
customerRouter.get('/', customerController.getMenu)

// export the router
module.exports = customerRouter
