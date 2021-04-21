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
    orderNumber: { 
        type: Number, 
        required: true, 
        unique: true, 
        min: 0
    },
    vendorID: {
        type: Number,
        required: true
    },
    customerID: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["COOKING", "READY", "PICKED UP"],
        required: true
    },
    snacks: [orderLineSchema]
}, 
{
    timestamps: true
}, 
{
    collection: 'orders' 
})

// export the orderLine and order model to be used by the controllers
const OrderLine = mongoose.model("OrderLine", orderLineSchema)
const Order = mongoose.model("Order", orderSchema)
module.exports = {
    OrderLine, 
    Order
}
