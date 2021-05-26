const express = require('express')

// add the index router 
const indexRouter = express.Router()

/* ----- GET routes ----- */

// handler for GET request for the home page
indexRouter.get('/', (req, res) => {
    res.send('<h1> Snack in a Van </h1>')
})

// handle the GET request for any other unspecified pages
indexRouter.get('/*', (req, res) => {
    res.send('<h1> 404 Not Found </h1>')
})

// export the router
module.exports = indexRouter 
