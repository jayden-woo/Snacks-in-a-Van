// temporary locally stored menu
// module.exports = [
//     {
//         "id":"1",
//         "name":"Big Cake",
//         "price":"35.00",
//     },
//     {
//         "id":"2",
//         "name":"Cappuccino",
//         "price":"5.00",
//     },
//     {
//         "id":"3",
//         "name":"Fancy Biscuit",
//         "price":"3.00",
//     },
//     {
//         "id":"4",
//         "name":"Flat White",
//         "last_pricename":"4.50",
//     }
// ]

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
