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
        delete req.session.status
        delete req.session.errors
        req.session.save()
    }
    return res.send('<h1> Log In Page <\h1>')
}

// log out a user
const logOut = (req, res) => {
    // kill the current session so a new session could be created on next req
    req.session.destroy()
    console.log("Customer has successfully logged out")
    return res.redirect('login')
}

// get the signup page
const getSignUp = (req, res) => {
    if (req.session.errors) {
        console.log(req.session.errors)
        delete req.session.status
        delete req.session.errors
        req.session.save()
    }
    return res.send('<h1> Sign Up Page <\h1>')
}

// get the account details page
const getAccount = (req, res) => {
    if (req.session.errors) {
        console.log(req.session.errors)
        delete req.session.status
        delete req.session.errors
        req.session.save()
    }
    return res.send('<h1> Account Details Page <\h1>')
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
        const snack = await Snack.findOne( {name: req.params.snackName}, {_id: false} )
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

// get all the submitted orders' details
const getOrders = async (req, res) => {
    if (req.session.errors) {
        console.log(req.session.errors)
        delete req.session.status
        delete req.session.errors
        req.session.save()
    }
    const customer = await Customer.findOne( {userID: req.session.user._id} )
    return res.send(await Order.find( {customerID: customer._id, status: {$ne: 'Ordering'}} ))
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
        if (await Customer.exists( {userID: user._id} )) {
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
                req.session.status = 200
                req.session.save()
                console.log("Customer has successfully logged in")
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

const validateInput = async (req) => {
    // validate password
    var result = {sucess: true, errors: []}
    if (!re_password.test(req.body.password)) {
        result.sucess = false;
        result.errors.push("password")
        //console.log("password is invalid")
        //req.session.status = 400
        //req.session.errors = 'Your password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character, and be between 8 to 20 characters in length.'
    }
    // validate username
    if (!re_username.test(req.body.username)) {
        result.sucess = false;
        result.errors.push("username")
        //console.log("username is invalid")
        //req.session.status = 400
        //req.session.errors = 'Your username should only contain numbers, underscores, lowercase, and uppercase letters.'
    }
    // validate email
    if (!re_email.test(req.body.email)) {
        result.sucess = false;
        result.errors.push("email")
        //console.log("email is invalid")
        //req.session.status = 400
        //req.session.errors = 'Please enter a valid email address.'
    }
    // validate last name
    if (!re_name.test(req.body.lastName)) {
        result.sucess = false;
        result.errors.push("lastName")
        //console.log("lastName is invalid")
        //req.session.status = 400
        //req.session.errors = 'Your name should only contain spaces, lowercase, and uppercase letters.'
    }
    // validate first name
    if (!re_name.test(req.body.firstName)) {
        result.sucess = false;
        result.errors.push("firstName")
        //console.log("firstName is invalid")
        //req.session.status = 400
        //req.session.errors = 'Your name should only contain spaces, lowercase, and uppercase letters.'
    }

    // check if the email is already in use
    //if (await User.findOne( {email: req.body.email} )) {
    //    // check if user is logged in
    //    if (!req.session.user || req.body.email != req.session.user.email) {
    //        console.log("email is taken")
    //        req.session.status = 409
    //        req.session.errors = 'The email address you have entered is already associated with another account.'
    //    }
    //}
    //// check if the username is already in use
    //if (await User.findOne( {username: req.body.username} )) {
    //    // check if user is logged in
    //    if (!req.session.user || req.body.username != req.session.user.username) {
    //        console.log("username is taken")
    //        req.session.status = 409
    //        req.session.errors = 'The username you have entered is already associated with another account.'
    //    }
    //}

    // check if any validation errors occured
    //if (!req.session.status || req.session.status != 400 && req.session.status != 409) {
    //    req.session.status = 200
    //}
    //req.session.save()
    //return req.session.status
    return result
}

const checkConflict = async (req) => {
    var result = {sucess: true, errors: []}
    if (await User.findOne( {email: req.body.email} )) {
        result.sucess  = false
        result.errors.push("email")
    }
    if (await User.findOne( {username: req.body.username} )) {
        result.sucess  = false
        result.errors.push("username")
    }
    return result
}


// register a new customer
const signUp = async (req, res) => {
    var result = {sucess: true, errors: []}
    result = await validateInput(req)
    if (!result.sucess) {
        return res.status(400).json(result)
    }
    result = await checkConflict(req)
    if (!result.sucess) {
        return res.status(409).json(result)
    }
    // check if the input is correctly formed and if the username or email is taken
    //if (await validateInput(req) != 200) {
    //    return res.redirect('signup')
    //}

    // create a new user
    const user = new User({
        username: req.body.username, 
        password: req.body.password, 
        email: req.body.email.toLowerCase()
    })
    // save user to database
    user.save((err) => {
        if (err) {
            result.sucess = false
            result.errors.push(err)
            return res.status(400).json(result)
            //req.session.errors = err
            //req.session.save()
            //return res.redirect('signup')
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
            result.sucess = false
            result.errors.push(err)
            return res.status(400).json(result)
            //req.session.errors = err
            //req.session.save()
            //return res.redirect('signup')
        }
    })

    return res.status(200).json(result)

    // TODO
    // send a succesful signup msg and redirect to the login page

    //return res.redirect('login')
}

// // update the details of a customer
// /* When username in database have capitals will cause problems !!!! */
// const updateDetails = async (req, res) => {
//     // Username case sensitive
//     const {firstName, lastName} = req.body
//     var result = {sucess: true, errors: []}
//     if(!firstName) {
//         result.errors.push("Empty first name")
//         result.sucess = false
//     }
//     if(!lastName) {
//         result.errors.push("Empty last name")
//         result.sucess = false
//     }
//     if (!result.sucess) {
//         return res.status(400).json(result)
//     } 
//     if (!re_name.test(firstName) || !re_name.test(lastName)) {
//         result.sucess = false
//         result.errors.push("Name should only contain alphabetical letters.")
//         return res.status(400).json(result)
//     }
//     try {
//         await Customer.updateOne({user:req.session.user._id}, {firstName:firstName, lastName:lastName}) 
//         res.status(200).json(result)
//         //res.redirect('/customer/account')
//     // error occurred during the database update
//     } catch (err) {
//         res.status(err.status).send(err.message)
//     }
    
// }

// update the details of a customer
const updateDetails = async (req, res) => {
    // check if the input is correctly formed and if the username or email is taken
    if (await validateInput(req) != 200) {
        if (req.session.status == 409 && username != req.session.user.username && username != req.session)
        return res.redirect('account')
    }

    // updating username and email
    await User.updateOne( {_id: req.session.user._id}, {username: req.body.username, email: req.body.email} )
    // updating password
    const user = await User.findOne( {_id: req.session.user._id} )
    user.set('password', req.body.password)
    user.save((err) => {
        if (err) throw err;
    })
    // updating first name and last name
    await Customer.updateOne( {userID: req.session.user._id}, {firstName: req.body.firstName, lastName: req.body.lastName} )

    return res.redirect('account')
}

// handle request to add a snack to order
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
        return res.redirect('/customer/menu')
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
        // error occured during saving of a new order
        if (err) throw err;
    })

    // save the order in the cookies
    req.session.order = order
    req.session.save()
    return res.redirect('/customer/menu')
}

// confirm the current order selections
const confirmOrder = (req, res) => {
    if (!req.session.order) {
        req.session.status = 400
        req.session.errors = 'Your cart is empty / Order not found.'
        req.session.save()
        return res.redirect('order')
    }
    req.session.order.set('status', 'Placed')
    req.session.order.save((err) => {
        if (err) throw err;
    })
    return res.redirect('order')
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
