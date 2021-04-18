const express = require('express')

// add the customer router 
const orderRouter = express.Router()

// add the customer controller
const orderController = require('../controllers/orderController.js')

orderRouter.get('/order/:id', orderController.queryOrder)
orderRouter.post('/order/:id/update', orderController.updateOrder)
orderRouter.post('/order/add', orderController.addOrder)
