const express = require('express')

// add our router 
const authorRouter = express.Router()

// require the author controller
const authorController = require('../controllers/authorController.js')

// handle the GET request toget all authors
authorRouter.get('/', (req, res) => authorController.getAllAuthors(req, res))
authorRouter.get('/:authorId', (req, res) => authorController.getOneAuthor(req, res))
authorRouter.post('/', (req, res) => authorController.addAuthor(req, res))
authorRouter.post('/update', (req, res) => authorController.updateAuthor(req, res))


// export the router
module.exports = authorRouter