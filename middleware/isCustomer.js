// check if a user is currently logged in as a customer
const isCustomer = (req, res, next) => {
    // check if the user is logged in
    if (!req.isAuthenticated()) {
        console.log("Not logged in")
        req.flash("redirectMessage", "Please log in frist before proceeding.")
        return res.status(401).redirect("/customer/login")
    // check if the logged in user is a customer
    } else if (req.user.constructor.modelName != "Customer") {
        console.log("Vendor accessing customer routes")
        req.flash("redirectMessage", "Sorry, you do not have permission to access this page.")
        // render error page or redirect to vendor main page
        return res.status(403).redirect("/vendor")
    }
    // user is an authenticated customer and can proceed
    return next()
}

// export the function
module.exports = isCustomer
