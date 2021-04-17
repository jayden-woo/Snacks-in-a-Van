const express = require('express')
const app = express()

// set up customer routes
const customerRouter = require('./routes/customerRouter')

// handler for GET home page
app.get('/', (req, res) => {
    res.send('<h1>Snacks in a Van</h1>')
})

// handler for customer requests
// customer routes are added onto the end of '/customer'
app.use('/customer', customerRouter)

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080

// listen to any request to the web app
app.listen(port, () => {
    console.log('The web app is listening on port', port)
})
