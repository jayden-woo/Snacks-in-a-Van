const express = require('express')

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// handle the GET request to get the nearest vans
customerRouter.get('/', customerController.getNearestVans)

// handle the GET request to get the menu
customerRouter.get('/menu', customerController.getMenu)

// handle the GET request to get details of one snack
customerRouter.get('/menu/:snackName', customerController.getSnackByName)

// handle the POST request to start a new order by add a snack to order
customerRouter.post('/menu/:snackName', customerController.addSnackToOrder)

// export the router
module.exports = customerRouter
