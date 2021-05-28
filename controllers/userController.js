const mongoose = require("mongoose")

// import the models used
const Customer = mongoose.model("Customer")
const Vendor = mongoose.model("Vendor")

// get the customer login page
const getCustomerLogIn = (req, res) => {
    return res.status(200).render("customer/login")
}

// get the vendor login page
const getVendorLogIn = (req, res) => {
    // return res.status(200).send('<h1> Vendor Log In Page <\h1>')
    return res.status(200).render("vendor/login")
}

// get the customer signup page
const getCustomerSignUp = (req, res) => {
    return res.status(200).render("customer/signup")
}

// get the vendor signup page
const getVendorSignUp = (req, res) => {
    return res.status(200).render("vendor/signup")
}

// get the customer or vendor account details
const getAccount = (req, res) => {
    try {
        return res.status(200).send(req.user)
    // error occured during query
    } catch (err) {
        return res.status(400).send("Oops! Something went wrong.")
    }
}

// log out a user
const logOut = (req, res) => {
    req.logout()
    req.flash("You have successfully logged out.")
    console.log("Logged out")
    return res.status(200).redirect(`/${req.originalUrl.split('/')[1]}/login`)
}

// update the account details of a customer
const customerUpdate = async (req, res) => {
    // check if email is supplied
    if (req.body.email) {
        // check if email is taken
        if (await Customer.findOne( {email: req.body.email} )) {
            console.log("Email is taken")
            req.flash("updateMessage", "The email address you have entered is already taken.")
            return res.status(409).send("Please enter another email address.")
        }
        // update email
        req.user.email = req.body.email
    }

    // check if old password is supplied
    if (req.body.oldPassword) {
        // check if old password matches
        if (!req.user.validPassword(req.body.oldPassword)) {
            console.log("Wrong old password")
            return res.status(401).send("The old password you have entered is incorrect.")
        }
        // update password
        req.user.password = req.user.generateHash(req.body.password)
    }

    // update first name and last name if supplied
    if (req.body.firstName) req.user.firstName = req.body.firstName
    if (req.body.lastName) req.user.lastName = req.body.lastName

    // save the user details
    req.user.save( (err) => {
        if (err) {
            console.log("Error while saving to database")
            return res.status(400).send("Oops! Something went wrong.")
        }
    })
    return res.status(200).send("Customer details updated successfully.")
}

// update the account details of a vendor
const vendorUpdate = async (req, res) => {
        // check if username is supplied
        if (req.body.username) {
            // check if username is taken
            if (await Vendor.findOne( {username: req.body.username} )) {
                console.log("Username is taken")
                req.flash("updateMessage", "The username you have entered is already taken.")
                return res.status(409).send("Please enter another username.")
            }
            // update username
            req.user.username = req.body.username
        }
    
        // check if old password is supplied
        if (req.body.oldPassword) {
            // check if old password matches
            if (!req.user.validPassword(req.body.oldPassword)) {
                console.log("Wrong old password")
                return res.status(401).send("The old password you have entered is incorrect.")
            }
            // update password
            req.user.password = req.user.generateHash(req.body.password)
        }
    
        // update availability if supplied
        if (req.body.isOnline) req.user.isOnline = req.body.isOnline

        // update location if supplied
        if (req.body.location) req.user.location = req.body.location
        if (req.body.textAddress) req.user.textAddress = req.body.textAddress
    
        // save the user details
        req.user.save( (err) => {
            if (err) {
                console.log("Error while saving to database")
                return res.status(400).send("Oops! Something went wrong.")
            }
        })
        return res.status(200).send("Vendor details updated successfully.")
}

// export the controller functions
module.exports = {
    getCustomerLogIn, 
    getVendorLogIn, 
    getCustomerSignUp, 
    getVendorSignUp, 
    getAccount, 
    logOut, 
    customerUpdate, 
    vendorUpdate
}
