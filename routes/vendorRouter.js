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
vendorRouter.get('/account', isVendor, userController.getAccount)

// handle the GET request to get all the outstanding order details
vendorRouter.get('/order', isVendor, vendorController.getOrders)

// handle the GET request to get details of one order
vendorRouter.get('/order/:orderNumber', isVendor, vendorController.getOrderByNumber)

// // handle the GET request to get the history of all previous orders
vendorRouter.get('/history', isVendor, vendorController.getOrderHistory)

/* ----- POST routes ----- */

// handle the POST request for the login page
vendorRouter.post('/login', isLoggedOut, passport.authenticate('vendor-login', {
    successRedirect: '/vendor', 
    failureRedirect: '/vendor/login', 
    failureFlash: true, 
    successFlash: true
}))

// handle the POST request for the signup page
vendorRouter.post('/signup', isLoggedOut, passport.authenticate('vendor-signup', {
    successRedirect: '/vendor/login', 
    failureRedirect: '/vendor/signup', 
    failureFlash: true, 
    successFlash: true
}))

// handle the POST request for logging out
vendorRouter.post('/logout', isVendor, userController.logOut)

// handle the POST request for changing the account details
vendorRouter.post('/account', isVendor, userController.vendorUpdate)

/* ----- PUT routes ----- */

// // handle the PUT request for marking an order as fulfilled
// vendorRouter.put('/order/:orderNumber/fulfilled', isVendor, vendorController.markFuilfilled)

// // handle the PUT request for marking an order as picked up
// vendorRouter.put('/order/:orderNumber/pickedup', isVendor, vendorController.markPickedUp)



// // GET requests by userid to find one vendor 
// vendorRouter.get('/:userID', vendorController.getVendorByUserID)

// // handle the GET request for the outstanding orders of a vendor
// // emmmmmmmmm
// vendorRouter.get('/:vendorID/outstanding', vendorController.getOutstandingOrders)


// // handle the POST request to add a new vendor
// // temporarily keeping to quickly add test vendors to database
// vendorRouter.post('/', vendorController.addVendor)

// // handle the POST request to update the status of a vendor
// vendorRouter.post('/account', isLoggedIn, vendorController.updateVendor)

// // handle the POST request to update the status of an order
// // havent test
// vendorRouter.post('/orders/:orderNum', isLoggedIn, vendorController.updateOrderStatus)



// export the router
module.exports = vendorRouter 


// get /
// get login
// get signup
// get account
// get order
// get order/id

// post login
// post signup
// post logout
// post account

// put order/id/fulfilled
// put order/id/pickedup

