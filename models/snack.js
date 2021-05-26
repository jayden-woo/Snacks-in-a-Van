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

// compile the schema into a model
const Snack = mongoose.model("Snack", snackSchema)

// export the model to be used by other files
module.exports = {
    Snack
}
