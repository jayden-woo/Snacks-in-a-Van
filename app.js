const express = require('express')
require('./models');

const app = express()
app.use(express.json())  // replaces body-parser
app.use(express.static('public')) // defines where the static files are located

const exphbs = require('express-handlebars') // include handlebars

// Configure Handlebars template engine 
app.engine('hbs', exphbs({
    defaultlayout: 'main', 
    extname: 'hbs'
}))

app.set('view engine', 'hbs') // Inform app to use template engine

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
