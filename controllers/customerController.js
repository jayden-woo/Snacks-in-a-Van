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
const re_name = /^[a-zA-Z ]+$/
// a standard email regex
const re_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
// a username can only contain alphanumeric characters and underscores
const re_username = /^[a-zA-Z0-9_]+$/
// a password must contain a digit, a special character, a lowercase, an uppercase, and between 8-20 characters
const re_password = /^(?=.*\d)(?=.*[.!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,20}$/


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

// get the login page
const getLogIn = (req, res) => {
    if (req.session.errors) {
        console.log(req.session.errors)
        delete req.session.errors
        req.session.save()
    }
    return res.send('<h1> Log In Page <\h1>')
}

// log out a user
const logOut = (req, res) => {
    delete req.session.user
    req.session.save()
    return res.redirect('login')
}

// get the signup page
const getSignUp = (req, res) => {
    if (req.session.errors) {
        console.log(req.session.errors)
        delete req.session.errors
        req.session.save()
    }
    return res.send('<h1> Sign Up Page <\h1>')
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
    User.findOne( {$or: [{username: req.body.username}, {email: req.body.username}]}, async function(err, user) {
        // couldn't find user in database
        if (!user || err) {
            console.log("User not found")
            req.session.status = 401
            req.session.errors = 'You have entered an invalid username or password'
            req.session.save()
            return res.redirect('login')
        }
        // check if the user is a customer
        if (await Customer.exists( {user: user._id} )) {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;
                // wrong password entered
                if (!isMatch) {
                    console.log("Wrong password")
                    req.session.status = 401
                    req.session.errors = 'You have entered an invalid username or password'
                    req.session.save()
                    return res.redirect('login')
                }
                // keep track of logged in user and go back to previous page
                req.session.user = user
                let redirectUrl = '/customer/menu'
                if (req.session.redirectUrl) {
                    redirectUrl = req.session.redirectUrl
                    delete req.session.redirectUrl
                }
                delete req.session.errors
                req.sessionstatus = 200
                req.session.save()
                return res.redirect(redirectUrl)
            })
        } else {
            console.log("User is not a customer")
            req.session.status = 401
            req.session.errors = 'You have entered an invalid username or password'
            req.session.save()
            return res.redirect('login')
        }
    })
}

const validateInput = (req) => {
    // validate password
    if (!re_password.test(req.body.password)) {
        console.log("password is invalid")
        req.session.status = 400
        req.session.errors = 'Your password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character, and be between 8 to 20 characters in length.'
    }
    // validate username
    if (!re_username.test(req.body.username)) {
        console.log("username is invalid")
        req.session.status = 400
        req.session.errors = 'Your username should only contain numbers, underscores, lowercase, and uppercase letters.'
    }
    // validate email
    if (!re_email.test(req.body.email)) {
        console.log("email is invalid")
        req.session.status = 400
        req.session.errors = 'Please enter a valid email address.'
    }
    // validate last name
    if (!re_name.test(req.body.lastName)) {
        console.log("lastName is invalid")
        req.session.status = 400
        req.session.errors = 'Your name should only contain lowercase and uppercase letters.'
    }
    // validate first name
    if (!re_name.test(req.body.firstName)) {
        console.log("firstName is invalid")
        req.session.status = 400
        req.session.errors = 'Your name should only contain lowercase and uppercase letters.'
    }
    // check if any validation errors occured
    if (req.session.status != 400) {
        req.session.status = 200
    }
    req.session.save()
    return req.session.status
}

// register a new customer
const signUp = async (req, res) => {

    // check if the input is correctly formed
    await validateInput(req)

    // check if the email is already in use
    await User.findOne( {email: req.body.email}, function (err, user) {
        if (user) {
            req.session.status = 409
            req.session.errors = 'The email address you have entered is already associated with another account.'
            req.session.save()
        }
    })
    // check if the username is already in use
    await User.findOne( {username: req.body.username}, function (err, user) {
        if (user) {
            req.session.status = 409
            req.session.errors = 'The username you have entered is already associated with another account.'
            req.session.save()
        }
    })

    // redirect user to restart signup process if any part of it has failed
    if (req.session.status != 200) {
        return res.redirect('signup')
    }

    // create a new user
    const user = await new User({
        username: req.body.username, 
        password: req.body.password, 
        email: req.body.email.toLowerCase()
    })
    // save user to database
    await user.save((err) => {
        if (err) {
            req.session.errors = err
            req.session.save()
            return res.redirect('signup')
        }
    })

    // create a new customer entry
    const customer = await new Customer({
        user: user._id, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName
    })
    // save customer to database
    await customer.save((err) => {
        if (err) {
            req.session.errors = err
            req.session.save()
            return res.redirect('signup')
        }
    })

    // TODO
    // send a succesful signup msg and redirect to the login page

    return res.redirect('login')
}

// update the details of a customer
/* When username in database have capitals will cause problems !!!! */
const updateDetails = async (req, res) => {
    // Username case sensitive
    const {firstName, lastName} = req.body
    var result = {sucess: true, errors: []}
    if(!firstName) {
        result.errors.push("Empty first name")
        result.sucess = false
    }
    if(!lastName) {
        result.errors.push("Empty last name")
        result.sucess = false
    }
    if (!result.sucess) {
        return res.status(400).json(result)
    } 
    if (!re_name.test(firstName) || !re_name.test(lastName)) {
        result.sucess = false
        result.errors.push("Name should only contain alphabetical letters.")
        return res.status(400).json(result)
    }
    try {
        await Customer.updateOne({user:req.session.user._id}, {firstName:firstName, lastName:lastName}) 
        res.status(200).json(result)
        //res.redirect('/customer/account')
    // error occurred during the database update
    } catch (err) {
        res.status(err.status).send(err.message)
    }
    
}

/* should work for both customer and vendor */
const updatePassword = (req,res) => {


}

// export the controller functions
module.exports = {
    getNearestVans, 
    getLogIn, 
    logOut, 
    getSignUp, 
    getMenu, 
    getSnackByName, 
    addSnackToOrder, 
    logIn, 
    signUp,
    updateDetails
}
