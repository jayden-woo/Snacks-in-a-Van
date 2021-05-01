const express = require('express')

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// add the checking middleware
const isLoggedIn = require('../middleware/isLoggedIn')

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
// customerRouter.get('/account', isLoggedIn, customerController.)

// handle the GET request to get the menu
customerRouter.get('/menu', customerController.getMenu)

// handle the GET request to get details of one snack
customerRouter.get('/menu/:snackName', customerController.getSnackByName)

/* ----- POST routes ----- */

// handle the POST request to start a new order by add a snack to order
customerRouter.post('/menu/:snackName', isLoggedIn, customerController.addSnackToOrder)

// handle the POST request for the login page
customerRouter.post('/login', customerController.logIn)

// handle the POST request for the signup page
customerRouter.post('/signup', customerController.signUp)

// handle the POST request for changing the account details
customerRouter.post('/account', isLoggedIn, customerController.updateDetails)

// export the router
module.exports = customerRouter
