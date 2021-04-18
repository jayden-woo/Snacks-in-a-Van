const express = require('express')
require('./models');

const app = express()
app.use(express.json())  // replaces body-parser

// set up customer routes
const authorRouter = require('./routes/authorRouter')
const customerRouter = require('./routes/customerRouter')

// handler for GET home page
app.get('/', (req, res) => {
    console.log('connected')
    res.send('<h1>Snack in a Van</h1>')
})

// Handle author-management requests
// the author routes are added onto the end of '/author-management'
app.use('/author-management', authorRouter)

// handler for customer requests
// customer routes are added onto the end of '/customer'
app.use('/customer', customerRouter)

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080

// listen to any request to the web app
app.listen(port, () => {
    console.log('The web app is listening on port', port)
})
