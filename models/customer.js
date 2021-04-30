const mongoose = require("mongoose")

// define the schema for a customer in the customers database
const customerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true
    }, 
    firstName: {
        type: String, 
        required: true, 
        trim: true
    }, 
    lastName: {
        type: String, 
        required: true, 
        trim: true
    }
}, {
    timestamps: true
}, {
    versionKey: false
}, {
    collection: 'customers' 
})

// export the customer model to be used by the controllers
const Customer = mongoose.model("Customer", customerSchema)
module.exports = Customer
