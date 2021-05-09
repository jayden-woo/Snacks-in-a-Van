// reset the default response (status = 200 for OK)
const resetResponse = (req, res, next) => {
    req.session.status = 200
    req.session.response = {success: true, errors: []}

    // login by default for easier development process
    req.session.user = {
       _id: '6091e37a8ca71d4af3d1f0bd',
       username: 'test',
       password: '$2b$10$MJHLUc10wOLLD7y0JyAgJ.5Eei2unEiblaPMMl4Lcc5uWQ7ptCz3i',
       email: 'test@gmail.com'
    }
    
    req.session.save()
    console.log("Response reset to status: " + req.session.status)
    return next()
}

// export the function
module.exports = resetResponse
