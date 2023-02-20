const express = require('express')
const passport = require('passport')

// Add the customer router 
const customerRouter = express.Router()

// Add the user and customer controller
const userController = require('../controllers/userController.js')
const customerController = require('../controllers/customerController.js')

// Add the required middlewares
const isCustomer = require('../middleware/isCustomer')
const isLoggedOut = require('../middleware/isLoggedOut')
const withinTimeLimit = require('../middleware/withinTimeLimit')

/* ----- GET Routes ----- */

// Handle the GET request to get the front page
customerRouter.get('/', customerController.getFrontPage)

// Handle the GET request to get the closest vendors
customerRouter.get('/map', customerController.getVendorsList)

// Handle the GET request to get the closest vendors
customerRouter.get('/api/map', customerController.getVendorsList)

// Handle the GET request for the login page
customerRouter.get('/login', isLoggedOut, userController.getCustomerLogIn)

// Handle the get request to log out
customerRouter.get('/logout', isCustomer, userController.logOut)

// Handle the GET request for the signup page
customerRouter.get('/signup', isLoggedOut, userController.getCustomerSignUp)

// Handle the GET request for the account details page
customerRouter.get('/account', isCustomer, userController.getCustomerAccount)

// Handle the GET request to get the menu
customerRouter.get('/menu', customerController.getMenu)

// Handle the GET request to get details of one snack
customerRouter.get('/menu/:snackName', customerController.getSnackByName)

// Handle the GET request to get the current cart
customerRouter.get('/cart',  customerController.getCart)

// Handle the GET request to get all the order details
customerRouter.get('/order', isCustomer, customerController.getOrders)

// Handle the GET request to get details of one order
customerRouter.get('/order/:orderNumber', isCustomer, customerController.getOrderByNumber)

// Handle the GET request to get the feedback page
customerRouter.get('/feedback', isCustomer, customerController.getFeedback)

/* ----- POST Routes ----- */

// Handle the POST request to store the current location
customerRouter.post('/', customerController.saveLocation)

// Handle the POST request to select a vendor
customerRouter.post('/map', customerController.selectVendor)

// Handle the POST request to log in
customerRouter.post('/login', isLoggedOut, passport.authenticate('customer-login'))

// Handle the POST request to sign up
customerRouter.post('/signup', isLoggedOut, passport.authenticate('customer-signup'))

// Handle the POST request to change the account details
customerRouter.post('/account', isCustomer, userController.customerUpdate)

// Handle the POST request to confirm the current order selections
customerRouter.post('/menu/order', isCustomer, customerController.confirmOrder)

/* ----- PUT Routes ----- */

// Handle the PUT request to update an order
customerRouter.put('/order/update', isCustomer, withinTimeLimit, customerController.updateOrder)

// Handle the PUT request to cancel an order
customerRouter.put('/order/cancel', isCustomer, withinTimeLimit, customerController.cancelOrder)

// Handle the PUT request to submit a feedback for the order
customerRouter.put('/feedback', isCustomer, customerController.submitFeedback)

// Export the router
module.exports = customerRouter
