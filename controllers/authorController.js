const mongoose = require("mongoose")

// import author model
const Author = mongoose.model("Author")

// get all authors
const getAllAuthors = async (req, res) => {
    try {
        const authors = await Author.find()
        return res.send(authors)
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

// find one author by their id
const getOneAuthor = async (req, res) => {
    try {
        const oneAuthor = await Author.findOne( {"authorId": req.params.id})
        if (oneAuthor === null) { // no author found in database
            res.status(404)
            return res.send("Author not found")
        }
        return res.send(oneAuthor) // author was found
    } catch (err) { // error occurred
        res.status(400)
        return res.send("Database query failed")
    }
}

// remember to export the functions
module.exports = {
    getAllAuthors,
    getOneAuthor
}