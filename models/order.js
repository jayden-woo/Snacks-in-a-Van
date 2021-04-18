// temporary locally stored orders
// module.exports = [
//     {
//         "orderNumber": "0",
//         "snacks": [
//             {
//                 "id": "3",
//                 "name": "Fancy Biscuit",
//                 "price": "3.00"
//             }
//         ]
//     }
// ]

const mongoose = require("mongoose")

// define the schema for one line of snacks to be usedd in the order schema
const orderLineSchema = new mongoose.Schema({
    snackId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Menu', 
        required: true
    }, 
    quantity: {
        type: Number, 
        required: true, 
        min: 1
    }
})

// define the schema for one order in the orders database
const orderSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true , 
        unique: true
    }, 
    snacks: 
        [orderLineSchema]
    , 
    timestamps: 
        true
})

// export the order model to be used by the controllers
const Order = mongoose.model("Order", orderSchema)
module.exports = Order
