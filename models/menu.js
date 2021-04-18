const mongoose = require("mongoose")

// define the schema for menu database
const menuSchema = new mongoose.Schema({
    snackName: { 
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
}, 
{
    collection: 'menu' 
})

// export the menu model to be used by the controllers
const Menu = mongoose.model("Menu", menuSchema)
module.exports = {
    Menu
}
