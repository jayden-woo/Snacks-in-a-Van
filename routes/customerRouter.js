const express = require('express')
const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:3003/customer/api/',
});

// add the customer router 
const customerRouter = express.Router()

// add the customer controller
const customerController = require('../controllers/customerController.js')

// add the required middlewares
const isLoggedIn = require('../middleware/isLoggedIn')
const getOrder = require('../middleware/getOrder')
const timeLimit = require('../middleware/timeLimit')

/* ----- GET routes ----- */
// handle the GET request to render the homepage 
customerRouter.get("/", (req, res) => {
  res.render('customer/customerHomePage')
})

// handle the GET request to render the vendorlist page
customerRouter.get("/vendorlist", customerController.getVendorsList)

// Front-end view map routing
// customerRouter.get('/map', (req, res) => {
//   res.render('map')
// })

// handle the GET request to get the nearest vans
// customerRouter.get('/api/map', customerController.getVendorsList);

// handle the GET request for the login page
// customerRouter.get('/login', customerController.getLogIn)

// GET login form
// http:localhost:5000/user/
customerRouter.get("/login", (req, res) => {
    res.render('customer/login');
});

// Front-end view signup routing
customerRouter.get('/signup', (req, res) => {
  res.render('customer/signup', { user: req.session.user });
});

// Front-end view menu routing
customerRouter.get('/menu', customerController.getMenu);

// handle the GET request to get details of one snack
customerRouter.get('/menu/:id', customerController.getSnackByName)

// Front-end view shopping cart routing
customerRouter.get('/cart', (req, res) => {
  res.render('customer/cart', { user: req.session.user });
});


// Front-end view order details routing
customerRouter.get('/order/detail/:id', isLoggedIn, (req, res) => {
  res.render('customer/orderDetail', { user: req.session.user });
});



// handle the GET request for the logging out
customerRouter.get('/logout', isLoggedIn, customerController.logOut)


// handle the GET request for the account details page
customerRouter.get('/account', isLoggedIn, customerController.getAccount)

// handle the GET request to get the menu
customerRouter.get('/api/menu', customerController.getMenu)


// handle the GET request to get all the submitted orders' details
// customerRouter.get('/order', isLoggedIn, customerController.getOrders)
customerRouter.get('/api/order',isLoggedIn, customerController.getOrders)

// Front-end view order list routing
customerRouter.get('/order', isLoggedIn, (req, res) => {
  res.render('customer/order', { user: req.session.user });
});

/* ----- POST routes ----- */
//handle the POST request for the user type
// customerRouter.post('/', customerController.getUserType)

// handle the POST request for the login page
customerRouter.post('/login', customerController.logIn)

// handle the POST request for vendorlist page
// customerRouter.post('/vendorlist', customerController.selectVendor)

// handle the POST request for the signup page
customerRouter.post('/api/signup', customerController.signUp)

// handle the POST request for changing the account details
customerRouter.post('/api/account', isLoggedIn, customerController.updateDetails)

// handle the POST request for the account update api
customerRouter.post(
  '/api/account/update',
  isLoggedIn,
  customerController.updateAccount,
);

// handle the POST request to start a new order by add a snack to order
customerRouter.post('/menu/:snackName', isLoggedIn, customerController.addSnackToOrder)

/* ----- PUT routes ----- */

// handle the PUT request to confirm and submit the current order
customerRouter.put('/api/order', isLoggedIn, customerController.confirmOrder)

// handle the GET request for rating an order
customerRouter.get("/order/rating/:id", isLoggedIn, (req, res) => {
  // console.log('req.', req.query, req.params)
    const {id} = req.params
    res.render('customer/rateorder', {id})
})

// handle the POST request for the order details api
customerRouter.get('/order/:orderId',isLoggedIn, customerController.getOneOrder)

// handle the POST request for the rating api
customerRouter.post(
  '/api/order/:orderId',
  isLoggedIn,
  customerController.ratingAnOrder,
);

// not fullfilled and timer less than 10
customerRouter.put('/api/order/update', isLoggedIn, timeLimit, customerController.updateOrder)

/* ------------------------------------------------------- */

// tested
customerRouter.put('/api/order/cancel', isLoggedIn, timeLimit, customerController.cancelOrder)





// customerRouter.post('/order/modify', isLoggedIn, timeLimit, customerController.modifyOrder)

// export the router
module.exports = customerRouter
