const mongoose = require("mongoose")

// import the models used
const Snack = mongoose.model("Snack")
const OrderLine = mongoose.model("OrderLine")
const Order = mongoose.model("Order")
const Customer = mongoose.model("Customer")
const User = mongoose.model("User")

// regex for user input validation
// a name can only be alphabetic characters
const re_name = /^[a-zA-Z ]+$/
// a standard email regex
const re_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
// a username can only contain alphanumeric characters and underscores
const re_username = /^[a-zA-Z0-9_]+$/
// a password must contain a digit, a special character, a lowercase, an uppercase, and between 8-20 characters
const re_password = /^(?=.*\d)(?=.*[.!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,20}$/

// get the nearest vans
const getNearestVans = (req, res) => {
    // TODO
    // find 5 nearest van locations using geolocation and send back the list
    const location = [{latitude: 23.6852, longitude: -24.6742}, {latitude: 20.7547, longitude: -21.8062}]
    return res.status(req.session.status).send(location)
}

// get the login page
const getLogIn = (req, res) => {
    return res.send('<h1> Log In Page <\h1>')
}

// log out a user
const logOut = (req, res) => {
    // kill the current session so a new session could be created on next req
    req.session.destroy()
    console.log("Customer has successfully logged out")
    // res.redirect('login')
    return res.status(200).json({success: true, errors: []})
}

// get the signup page
const getSignUp = (req, res) => {
    return res.send('<h1> Sign Up Page <\h1>')
}

// get the account details
const getAccount = async (req, res) => {
    try {
        const customer = await Customer.findOne( {userID: req.session.user._id} )
        // gather the customer details
        const details = {
            firstName: customer.firstName, 
            lastName: customer.lastName, 
            username: req.session.user.username, 
            email: req.session.user.email
        }
        return res.status(req.session.status).send(details)
    // error occured during query
    } catch (err) {
        req.session.response.success = false
        req.session.response.errors.push('failed query')
        req.session.save()
        return res.status(400).json(req.session.response)
    }
}

// get the menu from database
const getMenu = async (req, res) => {
    try {
        const menu = await Snack.find()
        return res.status(req.session.status).send(menu)
    // error occurred during query
    } catch (err) {
        req.session.response.success = false
        req.session.response.errors.push('failed query')
        req.session.save()
        return res.status(400).json(req.session.response)
    }
}

// get details of one snack from database by its name
const getSnackByName = async (req, res) => {
    try {
        // search for a snack by name
        const snack = await Snack.findOne( {name: req.params.snackName} )
        // snack not found in database
        if (snack === null) { 
            req.session.response.success = false
            req.session.response.errors.push('snack not found')
            req.session.save()
            return res.status(404).json(req.session.response)
        }
        // send back snack details
        return res.status(req.session.status).send(snack)
    // error occurred during query
    } catch (err) {
        req.session.response.success = false
        req.session.response.errors.push('failed query')
        req.session.save()
        return res.status(400).json(req.session.response)
    }
}

// get all the submitted orders' details
const getOrders = async (req, res) => {
    try {
        const customer = await Customer.findOne( {userID: req.session.user._id} )
        // excludes the incomplete order
        const orders = await Order.find( {customerID: customer._id, status: {$ne: 'Ordering'}} ).populate("vendorID")
        return res.status(req.session.status).json({success: true, allOrders: orders})
    // error occurred during query
    } catch (err) {
        req.session.response.success = false
        req.session.response.errors.push('failed query')
        req.session.save()
        return res.status(400).json(req.session.response)
    }
}

// sign in with either email or username and password
const logIn = (req, res) => {
    User.findOne( {$or: [{username: req.body.username}, {email: req.body.username}]}, async function(err, user) {
        // couldn't find user in database
        if (!user || err) {
            console.log("User not found")
            req.session.response.success = false
            // error message = 'You have entered an invalid username or password'
            req.session.response.errors.push('username/password invalid')
            req.session.save()
            // res.redirect('login')
            return res.status(401).json(req.session.response)
        }
        // check if the user is a customer
        if (await Customer.exists( {userID: user._id} )) {
            if (!await user.comparePassword(req.body.password)) {
                console.log("Wrong password")
                req.session.response.success = false
                // error message = 'You have entered an invalid username or password'
                req.session.response.errors.push('username/password invalid')
                req.session.save()
                // res.redirect('login')
                return res.status(401).json(req.session.response)
            }
            req.session.user = user
            req.session.save()
            console.log("Customer has successfully logged in")
            // res.redirect('login')
            return res.status(req.session.status).json(req.session.response)
        } else {
            console.log("User is not a customer")
            req.session.response.success = false
            // error message = 'You have entered an invalid username or password'
            req.session.response.errors.push('username/password invalid')
            req.session.save()
            // res.redirect('login')
            return res.status(401).json(req.session.response)
        }
    })
}

// validate the input for correct structures and unique username and email
const validateInput = async (req) => {
    // validate first name
    if (!re_name.test(req.body.firstName)) {
        console.log("FirstName is invalid")
        // error message = 'Your name should only contain spaces, lowercase, and uppercase letters.'
        req.session.response.errors.push("firstName invalid")
    }
    // validate last name
    if (!re_name.test(req.body.lastName)) {
        console.log("LastName is invalid")
        // error message = 'Your name should only contain spaces, lowercase, and uppercase letters.'
        req.session.response.errors.push("lastName invalid")
    }
    // validate username
    if (!re_username.test(req.body.username)) {
        console.log("Username is invalid")
        // error message = 'Your username should only contain numbers, underscores, lowercase, and uppercase letters.'
        req.session.response.errors.push("username invalid")
    }
    // validate email
    if (!re_email.test(req.body.email)) {
        console.log("Email is invalid")
        // error message = 'Please enter a valid email address.'
        req.session.response.errors.push("email invalid")
    }
    // validate password
    if (!re_password.test(req.body.password)) {
        console.log("Password is invalid")
        // error message = 'Your password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character, and be between 8 to 20 characters in length.'
        req.session.response.errors.push("password invalid")
    }

    // check if any validation errors occured
    if (req.session.response.errors.length != 0) {
        req.session.status = 400
        req.session.response.success = false
        req.session.save()
        return req.session.response.success
    }
    
    // check if the email is already in use
    if (await User.findOne( {email: req.body.email} )) {
        // check if user is logged in
        if (!req.session.user || req.body.email != req.session.user.email) {
            console.log("Email is taken")
            // error message = 'The email address you have entered is already associated with another account.'
            req.session.response.errors.push("email conflict")
        }
    }
    // check if the username is already in use
    if (await User.findOne( {username: req.body.username} )) {
        // check if user is logged in
        if (!req.session.user || req.body.username != req.session.user.username) {
            console.log("Username is taken")
            // error message = 'The username you have entered is already associated with another account.'
            req.session.response.errors.push("username conflict")
        }
    }

    // check if any conflicts occured
    if (req.session.response.errors.length != 0) {
        req.session.status = 409
        req.session.response.success = false
    }
    req.session.save()
    return req.session.response.success
}

// register a new customer
const signUp = async (req, res) => {
    // check if the input is correctly formed and if the username or email is taken
    if (!await validateInput(req)) {
        // res.redirect('signup')
        return res.status(req.session.status).json(req.session.response)
    }

    // create a new user
    const user = new User({
        username: req.body.username, 
        password: req.body.password, 
        email: req.body.email.toLowerCase()
    })
    // save user to database
    user.save((err) => {
        if (err) {
            req.session.response.success = false
            req.session.response.errors.push(err)
            req.session.save()
            // res.redirect('signup')
            return res.status(400).json(req.session.response)
        }
    })

    // create a new customer entry
    const customer = new Customer({
        userID: user._id, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName
    })
    // save customer to database
    customer.save((err) => {
        if (err) {
            req.session.response.success = false
            req.session.response.errors.push(err)
            req.session.save()
            // res.redirect('signup')
            return res.status(400).json(req.session.response)
        }
    })

    // res.redirect('login')
    return res.status(req.session.status).json(req.session.response)
}

// update the details of a customer
const updateDetails = async (req, res) => {
    // check if the input is correctly formed and if the username or email is taken
    if (!await validateInput(req)) {
        // res.redirect('account')
        return res.status(req.session.status).json(req.session.response)
    }

    const user = await User.findOne( {_id: req.session.user._id} )
    // check if old password is supplied
    if (req.body.oldPassword) {
        // check if old password matches
        if (!await user.comparePassword(req.body.oldPassword)) {
            console.log("Wrong old password")
            req.session.response.success = false
            req.session.response.errors.push('old password invalid')
            req.session.save()
            return res.status(401).json(req.session.response)
        }
        // updating password
        user.set('password', req.body.password)
        user.save( (err) => {
            if (err) throw err;
        })
    }

    // updating username and email
    await User.updateOne( {_id: req.session.user._id}, {username: req.body.username, email: req.body.email} )

    // updating first name and last name
    await Customer.updateOne( {userID: req.session.user._id}, {firstName: req.body.firstName, lastName: req.body.lastName} )

    // res.redirect('account')
    return res.status(req.session.status).json(req.session.response)
}

// add a snack to a new or unsubmitted order
const addSnackToOrder = async (req, res) => {
    // get the snack to be added and construct the new order line item
    const snack = await Snack.findOne( {name: req.params.snackName} )
    const lineItem = new OrderLine({
        snackID: snack._id, 
        quantity: req.body.quantity 
    })

    // add to existing order if present
    if (req.session.order) {
        req.session.order.snacks.push(lineItem)
        req.session.order.save()
        // res.redirect('/customer/menu')
        return res.status(req.session.status).json(req.session.response)
    }
    // else construct a new order
    const customer = await Customer.findOne( {userID: req.session.user._id} )
    const orderNumber = await Order.countDocuments()
    const order = new Order({
        orderNumber: orderNumber, 
        // TEMP uses a random vendor id for now
        // vendorID: req.session.vendor._id, 
        vendorID: "608f102ab079282ea08c8a85", 
        customerID: customer._id, 
        snacks: [lineItem]
    })
    // save the new order to the orders database
    order.save( (err) => {
        if (err) throw err;
    })

    // save the order in the cookies
    req.session.order = order
    req.session.save()
    // res.redirect('/customer/menu')
    return res.status(req.session.status).json(req.session.response)
}

// confirm the current order selections
const confirmOrder = (req, res) => {
    // order is missing or not created yet
    if (!req.session.order) {
        req.session.response.success = false
        // error message 'Your cart is empty / Order not found.'
        req.session.response.errors.push('order not found')
        // res.redirect('order')
        return res.status(400).json(req.session.response)
    }
    // update the status to 'Placed'
    req.session.order.set('status', 'Placed')
    req.session.order.save( (err) => {
        if (err) throw err;
    })
    // res.redirect('order')
    return res.status(req.session.status).json(req.session.response)
}

// export the controller functions
module.exports = {
    getNearestVans, 
    getLogIn, 
    logOut, 
    getSignUp, 
    getAccount, 
    getMenu, 
    getSnackByName, 
    getOrders, 
    logIn, 
    signUp,
    updateDetails, 
    addSnackToOrder, 
    confirmOrder
}
