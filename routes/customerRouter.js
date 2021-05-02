const express = require('express')

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// add the required middlewares
const isLoggedIn = require('../middleware/isLoggedIn')
const orderRequired = require('../middleware/orderRequired')

/* ----- GET routes ----- */

// handle the GET request to get the nearest vans
customerRouter.get('/', customerController.getNearestVans)

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
customerRouter.get('/order', customerController.getOrders)

/* ----- POST routes ----- */

// handle the POST request for the login page
customerRouter.post('/login', customerController.logIn)

// handle the POST request for the signup page
customerRouter.post('/signup', customerController.signUp)

// handle the POST request for changing the account details
customerRouter.post('/account', isLoggedIn, customerController.updateDetails)

// handle the POST request to start a new order by add a snack to order
customerRouter.post('/menu/:snackName', isLoggedIn, orderRequired, customerController.addSnackToOrder)

/* ----- PUT routes ----- */

// handle the PUT request 
customerRouter.put('/order', isLoggedIn, orderRequired, customerController.confirmOrder)

// export the router
module.exports = customerRouter
