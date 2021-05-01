const mongoose = require("mongoose")

// import the models used
//const Menu = mongoose.model("Menu")
const Snack = mongoose.model("Snack")
const OrderLine = mongoose.model("OrderLine")
const Order = mongoose.model("Order")

const Customer = mongoose.model("Customer")
const User = mongoose.model("User")


// regex for user input validation
// a name can only be alphabetic characters
const re_name = /^[a-zA-Z]+$/
// a standard email regex
const re_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
// a username can only contain alphanumeric characters and underscores
const re_username = /^[a-zA-Z0-9_]+$/
// a password must contain a digit, a special character, a lowercase, an uppercase, and between 8-20 characters
const re_password = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,20}$/


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
        const result = await Snack.find( {}, {_id: false} )
        return res.send(result)
    // error occurred during query
    } catch (err) {
        res.status(400)
        return res.send("Database query failed!")
    }
}

// handle request to get details of one snack
const getSnackByName = async (req, res) => {
    try {
        // search for a snack by name
        const snack = await Snack.findOne( {"snackName": req.params.snackName}, {_id: false} )
        // snack not found in database
        if (snack === null) { 
            // return an error message or error page
            res.status(404)
            return res.send('<h2> Oops! Snacks not found! </h2>')
        }
        // send back snack details
        return res.send(snack)
    // error occurred during query
    } catch (err) {
        res.status(400)
        return res.send("Database query failed!")
    }
}

// handle request to add a snack to order
const addSnackToOrder = async (req, res) => {
    // get the snack to be added
    let snack = await Snack.findOne( {"snackName": req.params.snackName} )

    // construct a new order line item
    const lineItem = await new OrderLine({
        snackID: snack._id, 
        quantity: req.body.quantity 
    })

    // construct a new order
    let orderNumber = await Order.countDocuments()
    const newOrder = await new Order({
        orderNumber: orderNumber, 
        customerID: req.get("customerID"), 
        vendorID: req.get("vendorName"), 
        snacks: [lineItem]
    })

    // save the new order to the orders database
    newOrder.save( (err, result) => {
        // error occured during saving of a new order
        if (err) res.send(err)
        // send back order details for checking
        res.send(result)
    })
}

// sign in with either email or username and password
const logIn = (req, res) => {
    Customer.findOne( {$or: [
            {user: {username: req.body.username}}, {user: {email: req.body.username}}
        ]}, function(err, user) {
        if (!user || err) {
            console.log("User not found")
            return res.redirect("/customer/login")
        }
        user.comparePassword(req.body.password, function(err, isMatch) {
            if (err) throw err;
            // Temp checking
            console.log(req.body.password, isMatch)
            // wrong password
            if (!isMatch) {
                console.log("Invalid password")
                return res.redirect("/customer/login")
            }
            // keep track of logged in user and go back to previous page
            req.session.user = user
            let redirectUrl = "/customer/menu"
            if (req.session.redirectUrl) {
                redirectUrl = req.session.redirectUrl
                delete req.session.redirectUrl
            }
            req.session.save()
            return res.redirect(redirectUrl)
        })
    })
}

// register a new customer
const signUp = async (req, res) => {
    /*
    // validate first name
    if (!re_name.test(req.body.firstName)) {
        console.log("firstName is invalid")
        req.session.errors = 'Your name should only contain lowercase and uppercase letters.'
        req.session.save()
        return res.send("firstName invalid message in signup page")
    }
    // validate last name
    if (!re_name.test(req.body.lastName)) {
        console.log("lastName is invalid")
        req.session.errors = 'Your name should only contain lowercase and uppercase letters.'
        req.session.save()
        return res.send("lastName invalid message in signup page")
    }

    // validate email
    if (!re_email.test(req.body.email)) {
        console.log("email is invalid")
        req.session.errors = 'Please enter a valid email address.'
        req.session.save()
        return res.send("email invalid message in signup page")
    } 

    // validate username
    if (!re_username.test(req.body.username)) {
        console.log("re_username is invalid")
        req.session.errors = 'Your username should only contain numbers, underscores, lowercase, and uppercase letters.'
        req.session.save()
        return res.send("re_username invalid message in signup page")
    }
    // validate password
    if (!re_password.test(req.body.password)) {
        console.log("password is invalid")
        req.session.errors = 'Your password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character, and be between 8 to 20 characters in length.'
        req.session.save()
        return res.send("password invalid message in signup page")
    }
 

    // check if the email is already in use
    await Customer.findOne( {user: {email: req.body.email}}, function (err, user) {
        if (user) {
            res.send("The email address you have entered is already associated with another account.")
            // req.session.errors = 'The email address you have entered is already associated with another account.'
            // req.session.save()
            // return res.redirect("customer/signup")
        }
    })
    // check if the username is already in use
    await Customer.findOne( {user: {username: req.body.username}}, function (err, user) {
        if (user) {
            res.send("The username you have entered is already associated with another account.")
            // req.session.errors = 'The username you have entered is already associated with another account.'
            // req.session.save()
            // return res.redirect("customer/signup")
            return
        }
    })
    */

    var usernameUsr = await User.findOne({"username": req.body.username})
    var emailUsr = await User.findOne({"email": req.body.email})

    emailConflict = (emailUsr && await Customer.findOne({"user": emailUsr._id}))
    usernameConflict = (usernameUsr && await Customer.findOne({"user": usernameUsr._id}))
    
    if(emailConflict && usernameConflict) {
        res.status(409).json({email: false, username: false});
    } else if(emailConflict) {
        res.status(409).json({email: false});
    } else if(usernameConflict) {
        res.status(409).json({username: false});
    } else {
        const newUser = await new User({
            username: req.body.username, 
            password: req.body.password, 
            email: req.body.email
        });
        await newUser.save((err) => {
            if(err) {
                res.status(400).json({success: false, err});
            } 
        });
        const newCustomer = await new Customer({
            user: newUser._id, 
            firstName: req.body.firstName, 
            lastName: req.body.lastName
        });
        await newCustomer.save((err, customerPost) => {
            if(err) {
                res.status(400).json({success: false, err});
            } else {
                res.status(200).json({success: true, customerPost});
            }
        });
    }


    /*
    // check if the email is already in use
    await Customer.findOne( {user: {email: req.body.email}}, function (err, user) {
        if (user) {
            req.session.errors = 'The email address you have entered is already associated with another account.'
            req.session.save()
            return res.redirect("customer/signup")
        }
    })
    // check if the username is already in use
    await Customer.findOne( {user: {username: req.body.username}}, function (err, user) {
        if (user) {
            req.session.errors = 'The username you have entered is already associated with another account.'
            req.session.save()
            return res.redirect("customer/signup")
        }
    })

    // create a new user
    const user = await new User({
        username: req.body.username, 
        password: req.body.password, 
        email: req.body.email
    })
    // save user to database
    await user.save((err) => {
        if (err) {
            req.session.errors = err
            req.session.save()
            return res.redirect("customer/signup")
        }
    })

    // create a new customer entry
    const customer = await new Customer({
        user: user._id, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName
    })
    // save customer to database
    await user.save((err) => {
        if (err) {
            req.session.errors = err
            req.session.save()
            return res.redirect("customer/signup")
        }
    })
    */

    // TODO
    // send a succesful signup msg and redirect to the login page

    //return res.redirect("customer/login")
}

// update the details of a customer
const updateDetails = (req, res) => {
    
}



// export the controller functions
module.exports = {
    getNearestVans, 
    getMenu, 
    getSnackByName, 
    addSnackToOrder, 
    logIn, 
    signUp,
    updateDetails
}
