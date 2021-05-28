const mongoose = require("mongoose")

// define the schema for a snack in the snacks database
const snackSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true
    },
    image: { 
        type: String, 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0
    }, 
    description: { 
        type: String
    }
}, {
    versionKey: false
}, {
    collection: 'snacks' 
})

// export the snack model to be used by the controllers
const Snack = mongoose.model("Snack", snackSchema)
module.exports = {
    Snack
}
