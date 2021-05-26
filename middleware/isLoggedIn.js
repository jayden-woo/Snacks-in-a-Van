// check if a user is currently logged in
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    console.log("Not logged in")
    req.flash("redirectMessage", "Please log in frist before proceeding.")
    return res.status(401).redirect(`/${req.originalUrl.split('/')[1]}/login`)
}

// export the function
module.exports = isLoggedIn
