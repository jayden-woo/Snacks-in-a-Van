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

status = ["Ordering", "Placed", "Cooking", "Fulfilled", "Picked-Up", "Cancelled"]

// define the schema for one order in the orders database
const orderSchema = new mongoose.Schema({
    orderNumber: { 
        type: Number, 
        required: true, 
        unique: true, 
        min: 0
    }, 
    vendorID: {
        type: String
    }, 
    // temporarily using number as the customerID as the schema doesn't exist yet
    customerID: {
        type: Number, 
        ref: 'Customer', 
        required: true
    }, 
    status: {
        type: String,
        enum: status,
        default: status[0], 
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
