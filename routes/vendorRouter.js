const express = require('express')
const passport = require('passport')

// Add the vendor router 
const vendorRouter = express.Router()

// Add the user and vendor controller
const userController = require('../controllers/userController.js')
const vendorController = require('../controllers/vendorController.js')

// Add the required middlewares
const isVendor = require('../middleware/isVendor')
const isLoggedOut = require('../middleware/isLoggedOut')

/* ----- GET Routes ----- */

// Handle the GET requests for the frontpage of the vendor app
vendorRouter.get('/', vendorController.getFrontPage)

// Handle the GET request for the login page
vendorRouter.get('/login', isLoggedOut, userController.getVendorLogIn)

// Handle the GET request for the signup page
vendorRouter.get('/signup', isLoggedOut, userController.getVendorSignUp)

// Handle the GET request for the account details page
vendorRouter.get('/account', isVendor, userController.getVendorAccount)

// Order list view rendering
vendorRouter.get('/order', isVendor, vendorController.viewOrderList)

// Handle the GET request to get all the outstanding order details
vendorRouter.get('/api/order', isVendor, vendorController.getOrders)

// Handle the GET request to get details of one order
vendorRouter.get('/order/:orderNumber', isVendor, vendorController.getOrderByNumber)

// Handle the GET request to get the history of all previous orders
vendorRouter.get('/api/history', isVendor, vendorController.getOrderHistory)

// Store view rendering
vendorRouter.get("/location", isVendor, vendorController.viewLocation);

/* ----- POST Routes ----- */

// Handle the POST request to log in
vendorRouter.post('/login', isLoggedOut, passport.authenticate('vendor-login'))

// Handle the POST request to sign up
vendorRouter.post('/signup', isLoggedOut, passport.authenticate('vendor-signup'))

// Handle the POST request to log out
vendorRouter.post('/logout', isVendor, userController.logOut)

// Handle the POST request to change the account details
vendorRouter.post('/account', isVendor, userController.vendorUpdate)

// Handle the POST request to change the account details
vendorRouter.post('/park', userController.vendorPark)

/* ----- PUT Routes ----- */

// Handle the PUT request for marking an order as fulfilled
vendorRouter.put('/order/:orderNumber/fulfilled', isVendor, vendorController.markFulfilled)

// Handle the PUT request for marking an order as picked up
vendorRouter.put('/order/:orderNumber/pickedup', isVendor, vendorController.markPickedUp)

// Export the router
module.exports = vendorRouter 
