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
        const oneAuthor = await Author.findOne( {"authorId": req.params.authorId})
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

const updateAuthor = async (req, res) => {
    const new_author = req.body   // construct changed Author object from body of POST
  
    try {
      const author = await Author.findOne( {"authorId": req.body.authorId} )  // check that an author with this Id already exists
      if (!author) {    // if author is not already in database, return an error
        res.status(400)
        return res.send("Author not found in database")
      }
  
      Object.assign(author, new_author)   // replace properties that are listed in the POST body
      let result = await author.save()    // save updated author to database
      return res.send(result)             // return saved author to sender
  
      } catch (err) {   // error detected
          res.status(400)
          return res.send("Database update failed")
      }
  }
  
  // add an author (POST)
  const addAuthor = async (req, res) => {
    const author = new Author(req.body)   // construct a new Author object from body of POST
  
    try {
        let result = await author.save()  // save new author object to database
        return res.send(result)           // return saved object to sender
    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database insert failed")
    }
  }


// remember to export the functions
module.exports = {
    getAllAuthors,
    getOneAuthor,
    updateAuthor,
    addAuthor
}