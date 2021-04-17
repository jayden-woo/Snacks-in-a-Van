const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

// set up author routes
const authorRouter = require('./routes/authorRouter')

// GET home page
app.get('/', (req, res) => {
    res.send('<h1>Library System</h1>')
})

// Handle author-management requests
// the author routes are added onto the end of '/author-management'
app.use('/author-management', authorRouter)

app.listen(port, () => {
    console.log('Example app listening at http://localhost:${port}')
})