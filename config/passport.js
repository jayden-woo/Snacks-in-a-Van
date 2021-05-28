const mongoose = require("mongoose")

// create local strategy for authenticating using email or username and password
const LocalStrategy = require('passport-local').Strategy

// import the user models
const Customer = mongoose.model("Customer")
const Vendor = mongoose.model("Vendor")

// configure the passport to user various local strategies for different users
const configPassport = (passport) => {

    // store user information in sessions
    passport.serializeUser( (user, done) => {
        done(null, {_id: user._id, role: user.constructor.modelName})
    })

    // retrieve user data from sessions
    passport.deserializeUser( (user, done) => {
        // search from customer database
        if (user.role === "Customer") {
            Customer.findById(user._id, function(err, user) {
                done(err, user)
            })
        // search from vendor database
        } else if (user.role === "Vendor") {
            Vendor.findById(user._id, function(err, user) {
                done(err, user)
            })
        // unidentified user type
        } else {
            done({errors: "No entity found."}, null)
        }
    })

    // handle login for customer
    passport.use("customer-login", new LocalStrategy({
        usernameField: "email", 
        passwordField: "password", 
        passReqToCallback : true
    }, (req, email, password, done) => {
        // search for the customer instance in the database
        Customer.findOne( {email: email}, function(err, user) {
            if (err) {
                return done(err)
            }
            // wrong email
            if (!user) {
                console.log("Customer not found")
                return req.res.status(200).json({success: false, message: ["You have entered an invalid username or password."]})
            }
            // wrong password
            if (!user.validPassword(password)) {
                console.log("Wrong password")
                return req.res.status(200).json({success: false, message: ["You have entered an invalid username or password."]})
            // user is found and authenticated
            } else {
                console.log("Customer has successfully logged in")
                done(null, user)
                return req.res.status(200).json({success: true, message: ["You have successfully logged in."]})
            }
        })
    }))

    // handle login for vendor
    passport.use("vendor-login", new LocalStrategy({
        usernameField: "username", 
        passwordField: "password", 
        passReqToCallback : true
    }, (req, username, password, done) => {
        // search for the vendor instance in the database
        Vendor.findOne( {username: username}, function(err, user) {
            if (err) {
                return done(err)
            }
            // wrong username
            if (!user) {
                console.log("Vendor not found")
                return req.res.status(200).json({success: false, message: ["You have entered an invalid username or password."]})
            }
            // wrong password
            if (!user.validPassword(password)) {
                console.log("Wrong password")
                return req.res.status(200).json({success: false, message: ["You have entered an invalid username or password."]})
            // user is found and authenticated
            } else {
                console.log("Vendor has successfully logged in")
                done(null, user)
                return req.res.status(200).json({success: true, message: ["You have successfully logged in."]})
            }
        })
    }))

    // handle signing up new customer
    passport.use("customer-signup", new LocalStrategy({
        usernameField: "email", 
        passwordField: "password",
        passReqToCallback: true
    }, (req, email, password, done) => {
        // search for customer with the same email in the database
        Customer.findOne( {email: email}, function(err, user) {
            if (err) {
                return done(err)
            }
            // email is taken
            if (user) {
                console.log("Email is taken")
                return req.res.status(200).json({success: false, message: ["The email address you have entered is already taken."]})
            } else {
                // constuct a new customer instance with the given details
                const customer = new Customer({
                    email: email, 
                    firstName: req.body.firstName, 
                    lastName: req.body.lastName
                })
                // hash the password before storing it
                customer.password = customer.generateHash(password)
                // save customer to database
                customer.save( (err) => {
                    if (err) {
                        console.log("Error while saving")
                        return done(null, false)
                    }
                    console.log("Customer created")
                    return req.res.status(200).json({success: true, message: ["You have successfully signed up."]})
                })
            } 
        })
    }))

    // handle signing up new vendor
    passport.use("vendor-signup", new LocalStrategy({
        usernameField: "username", 
        passwordField: "password",
        passReqToCallback: true
    }, (req, username, password, done) => {
        // search for vendor with the same username in the database
        Vendor.findOne( {username: username}, function(err, user) {
            if (err) {
                return done(err)
            }
            // username is taken
            if (user) {
                console.log("Username is taken")
                return req.res.status(200).json({success: false, message: ["The username you have entered is already taken."]})
            } else {
                // constuct a new vendor instance with the given username
                const vendor = new Vendor({
                    username: username
                })
                // hash the password before storing it
                vendor.password = vendor.generateHash(password)
                // save vendor to database
                vendor.save( (err) => {
                    if (err) {
                        console.log("Error while saving")
                        console.log(err)
                        return done(null, false)
                    }
                    console.log("Vendor created")
                    return req.res.status(200).json({success: true, message: ["You have successfully signed up."]})
                })
            } 
        })
    }))

}

// export the config function
module.exports = {
    configPassport
}
