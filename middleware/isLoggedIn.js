const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        req.session.status = 401
        req.session.errors = 'Please log in before proceeding.'
        req.session.redirectUrl = req.url
        req.session.save()
        return res.redirect('../login')
    }
    return next()
}

// export the function
module.exports = isLoggedIn
