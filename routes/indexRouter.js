const express = require('express')

// add the index router 
const indexRouter = express.Router()

/* ----- GET routes ----- */

// handler for GET request for the home page
indexRouter.get('/', (req, res) => {
    // render the main index page
    // res.status(200).send('<h1> Snack in a Van </h1>')
    return res.status(200).render("index")
})

// handle the GET request for any other unspecified routes
indexRouter.get('*', (req, res) => {
    // render an error page
    return res.status(404).render("error", {code: "404", message: "Page not found."})
})

// export the router
module.exports = indexRouter 
