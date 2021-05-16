const mongoose = require("mongoose")

// define the schema for one line of snacks to be usedd in the order schema
const orderLineSchema = new mongoose.Schema({
    snackID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Snack', 
        required: true
    }, 
    quantity: {
        type: Number, 
        required: true, 
        min: 1
    }
})

// define the schema for customer information - this is the embedded method
const customerLineSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    first_name: {
        type: String,
        required: true
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    }, 
    customerID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true
        // [customerLineSchema],
    },
    status: {
        type: String, 
        enum: status, 
        default: status[0], 
        required: true
    },
    snacks: 
        [orderLineSchema]
    , 
    duration: {
        type: Number, 
        min: 0
    }, 
    rating: {
        type: Number, 
        min: 1, 
        max: 5
    }, 
    comment: {
        type: String
    }
}, {
    timestamps: true
}, {
    versionKey: false
}, {
    collection: 'orders' 
})

// export the orderLine and order model to be used by the controllers
const OrderLine = mongoose.model("OrderLine", orderLineSchema)
const Order = mongoose.model("Order", orderSchema)
module.exports = {
    OrderLine, 
    Order
}
