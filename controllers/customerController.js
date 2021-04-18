// link to the temporary menu model
// const menu = require('../models/menu')
// link to the temporary orders model
// const orders = require('../models/order')

const mongoose = require("mongoose")

// import the models used
// const Menu = mongoose.model("Menu")
const { Menu } = require('../models/menu.js')
// const Order = mongoose.model("Order")
const { Order } = require('../models/order.js')

// handle request to get the nearest vans
const getNearestVans = (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write('<h1> Nearest Vans Locations </h1>')
    res.write('<p> List of 5 nearest vans: </p>')
    res.write('<ul>')
    res.write('<li> Location 1 </li>')
    res.write('<li> Location 2 </li>')
    res.write('<li> Location 3 </li>')
    res.write('<li> Location 4 </li>')
    res.write('<li> Location 5 </li>')
    res.end('</ul>')
}

// handle request to get the menu
const getMenu = async (req, res) => {
    try {
        const result = await Menu.find( {}, {_id: false} )
        res.send(result)
    // error occurred during query
    } catch (err) {
        res.status(400)
        res.send("Database query failed!")
    }
}

// handle request to get details of one snack
const getSnackByName = async (req, res) => {
    try {
        // search for a snack by name
        const snack = await Menu.findOne( {"snackName": req.params.snackName}, {_id: false} )
        // snack not found in database
        if (snack === null) { 
            // return an error message or error page
            res.status(404)
            res.setHeader("Content-Type", "text/html")
		    res.write('<h1> Error 404 </h1>')
            res.end('<h2> Oops! Snacks not found! </h2>')
        }
        // send back snack details
        res.send(snack)
    // error occurred during query
    } catch (err) {
        res.status(400)
        res.send("Database query failed!")
    }
}

// handle request to add a snack to order
const addSnackToOrder = (req, res) => {
    // construct a new order
    let newOrder = {
        "orderNumber":orders.length.toString(), 
        "snacks":[
            menu.find(snack => snack.id === req.params.id)
        ]
    }
    // add the new order to the database
    orders.push(newOrder)
    // return entire orders list to browser as a check
    res.send(orders)
}

// export the controller functions
module.exports = {
    getNearestVans, 
    getMenu, 
    getSnackByName, 
    addSnackToOrder
}
