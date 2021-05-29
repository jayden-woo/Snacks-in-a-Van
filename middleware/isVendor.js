// check if a user is currently logged in as a vendor
const isVendor = (req, res, next) => {
    // check if the user is logged in
    if (!req.isAuthenticated()) {
        console.log("Not logged in")
        // req.flash("redirectMessage", "Please log in frist before proceeding.")
        return res.status(401).redirect("/vendor/login")
    // check if the logged in user is a vendor
    } else if (req.user.constructor.modelName != "Vendor") {
        console.log("Customer accessing vendor routes")
        // req.flash("redirectMessage", "Sorry, you do not have permission to access this page.")
        // render error page or redirect to customer main page
        return res.status(403).redirect("/customer")
    }
    // user is an authenticated vendor and can proceed
    return next()
}

// export the function
module.exports = isVendor
