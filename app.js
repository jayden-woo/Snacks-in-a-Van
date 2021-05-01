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
    saveUninitialized: false
}))

// for reading body of requests
app.use(express.json())

// set up database
const db = require('./models/db.js')

// set up customer and vendor routes
const customerRouter = require('./routes/customerRouter')
const vendorRouter =  require('./routes/vendorRouter')

// handler for GET home page
app.get('/', (req, res) => {
    // TODO
    // implement choosing customer or vendor app
    res.send('<h1>Snack in a Van</h1>')
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
