const express = require('express')
require('./models');

const app = express()
app.use(express.json())  // replaces body-parser

// set up author routes
const authorRouter = require('./routes/authorRouter')

// GET home page
app.get('/', (req, res) => {
    console.log('connected')
    res.send('<h1>Snack in a Van</h1>')
})

// Handle author-management requests
// the author routes are added onto the end of '/author-management'
app.use('/author-management', authorRouter)

app.listen(process.env.PORT || 3000, () => {
    console.log("Running!")
})