const express = require('express')
require('./models/db.js');

const app = express()
app.use(express.json())  // replaces body-parser

// set up customer and vendor routes
const customerRouter = require('./routes/customerRouter')
const vendorRouter =  require('./routes/vendorRouter')

// handler for GET home page
app.get('/', (req, res) => {
    console.log('connected')
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
