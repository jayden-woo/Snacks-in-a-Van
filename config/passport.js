const mongoose = require("mongoose")

// used to create our local strategy for authenticating
// using username and password
const LocalStrategy = require('passport-local').Strategy

// our user model
const Customer = mongoose.model("Customer")
const Vendor = mongoose.model("Vendor")

const configPassport = (passport) => {

    // store user information in sessions
    passport.serializeUser( (user, done) => {
        done(null, {_id: user._id, role: user.constructor.modelName})
    })

    // retrieve user data from sessions
    passport.deserializeUser( (user, done) => {
        if (user.role === "Customer") {
            Customer.findById(user._id, function(err, user) {
                done(err, user)
            })
        } else if (user.role === "Vendor") {
            Vendor.findById(user._id, function(err, user) {
                done(err, user)
            })
        } else {
            done({errors: "No entity found."}, null)
        }
    })

    passport.use("customer-login", new LocalStrategy({
        usernameField: "email", 
        passwordField: "password", 
        passReqToCallback : true
    }, (req, email, password, done) => {
        Customer.findOne( {email: email}, function(err, user) {
            if (err) {
                return done(err)
            }
            if (!user) {
                console.log("Customer not found")
                return done(null, false, req.flash("loginMessage", "You have entered an invalid username or password."))
            }
            if (!user.validPassword(password)) {
                console.log("Wrong password")
                return done(null, false, req.flash("loginMessage", "You have entered an invalid username or password"))
            } else {
                console.log("Customer has successfully logged in")
                return done(null, user, req.flash("loginMessage", "Login Successful."))
            }
        })
    }))

    passport.use("vendor-login", new LocalStrategy({
        usernameField: "username", 
        passwordField: "password", 
        passReqToCallback : true
    }, (req, username, password, done) => {
        Vendor.findOne( {username: username}, function(err, user) {
            if (err) {
                return done(err)
            }
            if (!user) {
                console.log("Vendor not found")
                return done(null, false, req.flash("loginMessage", "You have entered an invalid username or password"))
            }
            if (!user.validPassword(password)) {
                console.log("Wrong password")
                return done(null, false, req.flash("loginMessage", "You have entered an invalid username or password"))
            } else {
                console.log("Vendor has successfully logged in")
                return done(null, user, req.flash("loginMessage", "Login Successful."))
            }
        })
    }))

    passport.use("customer-signup", new LocalStrategy({
        usernameField: "email", 
        passwordField: "password",
        passReqToCallback: true
    }, (req, email, password, done) => {
        Customer.findOne( {email: email}, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                console.log("Email is taken")
                return done(null, false, req.flash("signupMessage", "The email address you have entered is already taken."))
            } else {
                const customer = new Customer({
                    email: email, 
                    firstName: req.body.firstName, 
                    lastName: req.body.lastName
                })
                customer.password = customer.generateHash(password)
                // save customer to database
                customer.save( (err) => {
                    if (err) {
                        console.log("Error while saving")
                        return done(null, false, req.flash("signupMessage", "Please try again in a few minutes."))
                    }
                    console.log("Customer created")
                    return done(null, customer, req.flash("signupMessage", "Sign Up Successful."))
                })
            } 
        })
    }))

    passport.use("vendor-signup", new LocalStrategy({
        usernameField: "username", 
        passwordField: "password",
        passReqToCallback: true
    }, (req, username, password, done) => {
        Vendor.findOne( {username: username}, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                console.log("Username is taken")
                return done(null, false, req.flash("signupMessage", "The username you have entered is already taken."))
            } else {
                const vendor = new Vendor({
                    username: username
                })
                vendor.password = vendor.generateHash(password)
                // save vendor to database
                vendor.save( (err) => {
                    if (err) {
                        console.log("Error while saving")
                        return done(null, false, req.flash("signupMessage", "Please try again in a few minutes."))
                    }
                    console.log("Vendor created")
                    return done(null, vendor, req.flash("signupMessage", "Sign Up Successful."))
                })
            } 
        })
    }))

}

module.exports = {
    configPassport
}
