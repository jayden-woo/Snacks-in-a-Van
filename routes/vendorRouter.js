const express = require('express')
const passport = require('passport')

// add the vendor router 
const vendorRouter = express.Router()

// add the user and vendor controller
const userController = require('../controllers/userController.js')
const vendorController = require('../controllers/vendorController.js')

// add the required middlewares
const isVendor = require('../middleware/isVendor')
const isLoggedOut = require('../middleware/isLoggedOut')

/* ----- GET routes ----- */

// handle the GET requests for the frontpage of the vendor app
vendorRouter.get('/', vendorController.getFrontPage)

// handle the GET request for the login page
vendorRouter.get('/login', isLoggedOut, userController.getVendorLogIn)

// handle the GET request for the signup page
vendorRouter.get('/signup', isLoggedOut, userController.getVendorSignUp)

// handle the GET request for the account details page
vendorRouter.get('/account', isVendor, userController.getVendorAccount)

// handle the GET request to get all the outstanding order details
vendorRouter.get('/order', isVendor, vendorController.getOrders)

// handle the GET request to get details of one order
vendorRouter.get('/order/:orderNumber', isVendor, vendorController.getOrderByNumber)

// // handle the GET request to get the history of all previous orders
vendorRouter.get('/history', isVendor, vendorController.getOrderHistory)

/* ----- POST routes ----- */

// handle the POST request to log in
vendorRouter.post('/login', isLoggedOut, passport.authenticate('vendor-login'))

// handle the POST request to sign up
vendorRouter.post('/signup', isLoggedOut, passport.authenticate('vendor-signup'))

// handle the POST request to log out
vendorRouter.post('/logout', isVendor, userController.logOut)

// handle the POST request to change the account details
vendorRouter.post('/account', isVendor, userController.vendorUpdate)

/* ----- PUT routes ----- */

// handle the PUT request for marking an order as fulfilled
vendorRouter.put('/order/:orderNumber/fulfilled', isVendor, vendorController.markFulfilled)

// handle the PUT request for marking an order as picked up
vendorRouter.put('/order/:orderNumber/pickedup', isVendor, vendorController.markPickedUp)

// export the router
module.exports = vendorRouter 
