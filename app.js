// packages or schema imports
const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const session = require('express-session')
const app = express()

// set up HTTP headers for web app security
app.use(helmet())

// for keeping track of data in between pages
app.use(cookieParser())
app.use(session({
    secret: "INFO30005 Web-App",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // user should log in again after restarting the browser
        expires: false, 
        // 2 hours before cookies expire and have to log in again
        maxAge: 2 * 60 * 60 * 1000
    }
}))

// for reading body of requests
app.use(express.json())

// set up database
const db = require('./models/db.js')

// set up the middlewares
const resetResponse = require('./middleware/resetResponse')
const isLoggedIn = require('./middleware/isLoggedIn')

// set up customer and vendor routes
const customerRouter = require('./routes/customerRouter')
const vendorRouter =  require('./routes/vendorRouter')

// handler for GET home page
app.get('/', (req, res) => {
    res.send('<h1> Snack in a Van </h1>')
});
// handler for GET request to log out a user
app.get('/logout', isLoggedIn, (req, res) => {
    // kill the current session so a new session could be created on next req
    req.session.destroy()
    console.log("User has successfully logged out")
    return res.status(200).json({success: true, errors: []})
})

// handler for customer and vendor requests
// customer routes are added onto the end of '/customer'
app.use('/customer', resetResponse, customerRouter)
// vendor routes are added onto the end of '/vendor'
app.use('/vendor', resetResponse, vendorRouter)

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080

// listen to any request to the web app
app.listen(port, () => {
    console.log('The web app is listening on port', port)
})
