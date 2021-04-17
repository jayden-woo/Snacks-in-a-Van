// link to the temporary menu model
const menu = require('../models/menu')
// link to the temporary orders model
const orders = require('../models/order')

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
const getMenu = (req, res) => {
    res.send(menu)
}

// handle request to get details of one snack
const getSnackByID = (req, res) => {
	
	// search for a snack by ID
	const snack = menu.find(snack => snack.id === req.params.id);

    // check for presence of snack in database
	if (snack){
        // send back the snack details
		res.send(snack)
	}
	else{
		// return an error message or error page
        res.statusCode = 404
        res.setHeader("Content-Type", "text/html");
		res.write('<h1> Error 404 </h1>')
        res.end('<h2> Oops! Snacks not found! </h2>')
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
    getSnackByID, 
    addSnackToOrder
}
