// check if a user is currently logged in
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        // req.session.response.success = false
        // error message = 'Please log in before proceeding'
        // req.session.response.errors.push('login required')
        // req.session.save()
        // req.session.redirectUrl = req.url
        // res.redirect('login')
        res.redirect('/customer/login');
        // return res.status(401).json(req.session.response)
    }

    return next()
}

// export the function
module.exports = isLoggedIn
