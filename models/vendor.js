const mongoose = require("mongoose")

// define the schema for vendor database
const vendorSchema = new mongoose.Schema({
    vendorID: { 
        type: String, 
        unique: true,
        required : true
    },
    isOnline: {
        type: Boolean,
        required : true,
    },
    latitude: { 
        type: Number,
        required: true, 
    },
    longitude: { 
        type: Number,
        required: true, 
    },
    description: { 
        type: String
    }
},
{
    timestamps: true
}, 
{
    collection: 'vendors' 
})

const Vendor = mongoose.model("Vendor", vendorSchema)
module.exports = Vendor
