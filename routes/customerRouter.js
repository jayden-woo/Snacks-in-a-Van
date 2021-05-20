const express = require('express')

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// add the required middlewares
const isLoggedIn = require('../middleware/isLoggedIn')
const getOrder = require('../middleware/getOrder')

/* ----- GET routes ----- */

// handle the GET request to get the closest vendors
customerRouter.get('/', customerController.getVendorsList)

// handle the GET request for the login page
customerRouter.get('/login', customerController.getLogIn)

// handle the GET request for the logging out
customerRouter.get('/logout', isLoggedIn, customerController.logOut)

// handle the GET request for the signup page
customerRouter.get('/signup', customerController.getSignUp)

// handle the GET request for the account details page
customerRouter.get('/account', isLoggedIn, customerController.getAccount)

// handle the GET request to get the menu
customerRouter.get('/menu', customerController.getMenu)

// handle the GET request to get details of one snack
customerRouter.get('/menu/:snackName', customerController.getSnackByName)

// handle the GET request to get all the submitted orders' details
customerRouter.get('/order', isLoggedIn, customerController.getOrders)

/* ----- POST routes ----- */

// handle the POST request to select a vendor
customerRouter.post('/', customerController.selectVendor)

// handle the POST request for the login page
customerRouter.post('/login', customerController.logIn)

// handle the POST request for the signup page
customerRouter.post('/signup', customerController.signUp)

// handle the POST request for changing the account details
customerRouter.post('/account', isLoggedIn, customerController.updateDetails)

// handle the POST request to start a new order by add a snack to order
customerRouter.post('/menu/:snackName', isLoggedIn, getOrder, customerController.addSnackToOrder)

/* ----- PUT routes ----- */

// handle the PUT request to confirm and submit the current order
customerRouter.put('/order', isLoggedIn, getOrder, customerController.confirmOrder)

// export the router
module.exports = customerRouter
