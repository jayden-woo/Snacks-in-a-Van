const express = require('express')
require('./models/db.js')

// TEMP
const mongoose = require("mongoose")
const User = mongoose.model("User")

const app = express()
app.use(express.json())  // replaces body-parser

// set up customer and vendor routes
const customerRouter = require('./routes/customerRouter')
const vendorRouter =  require('./routes/vendorRouter')

// handler for GET home page
app.get('/', (req, res) => {
    // res.send('<h1>Snack in a Van</h1>')

    // TEMP
    // fetch user and test password verification
    User.findOne( {username: 'testUser'}, function(err, user) {
        if (err) throw err;

        // test a matching password
        user.comparePassword('Password123', function(err, isMatch) {
            if (err) throw err;
            console.log('Password123', isMatch)  // -> Password123: true
        })

        // test a failing password
        user.comparePassword('123Password', function(err, isMatch) {
            if (err) throw err;
            console.log('123Password', isMatch)  // -> 123Password: false
        })

        // test another failing password
        user.comparePassword('Password', function(err, isMatch) {
            if (err) throw err;
            console.log('Password', isMatch)  // -> 123Password: false
        })
    })
    res.send()
})

// TEMP
app.post('/', async (req, res) => {
    // // create a user a new user
    // const testUser = new User({
    //     username: "testUser",
    //     password: "Password123"
    // })

    // // save user to database
    // await testUser.save((err) => {
    //     if (err) throw err;
    // })

    await User.findOne( {username:'testUser'}, async function(err, user) {
        if (err) throw err;
        await user.set('password', 'Password123')
        user.save((err) => {
            if (err) return err;
        })
    })
    
    res.send(await User.find())
})

// handler for customer and vendor requests
// customer routes are added onto the end of '/customer'
app.use('/customer', customerRouter)
// vendor routes are added onto the end of '/vendor'
app.use('/vendor', vendorRouter)

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080

// listen to any request to the web app
app.listen(port, () => {
    console.log('The web app is listening on port', port)
})
