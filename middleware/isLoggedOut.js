// check if a user is currently logged out
const isLoggedOut = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next()
    }
    console.log("Is logged in")
    return res.status(200).redirect(`/${req.originalUrl.split('/')[1]}`)
}

// export the function
module.exports = isLoggedOut
