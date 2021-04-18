const mongoose = require("mongoose")

const authorSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true }
})

const Author = mongoose.model("Author", authorSchema)
module.exports = Author