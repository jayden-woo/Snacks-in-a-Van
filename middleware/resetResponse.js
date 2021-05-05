// reset the default response (status = 200 for OK)
const resetResponse = (req, res, next) => {
    req.session.status = 200
    req.session.response = {success: true, errors: []}
    req.session.save()
    console.log("Response reset to status: " + req.session.status)
    return next()
}

// export the function
module.exports = resetResponse
