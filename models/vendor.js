const mongoose = require("mongoose")

// define the schema for a vendor in the vendors database
const vendorSchema = new mongoose.Schema({
    vendorName: { 
        type: String, 
        unique: true, 
        required : true
    }, 
    isOnline: {
        type: Boolean, 
        required : true
    }, 
    latitude: { 
        type: Number, 
        min: -90, 
        max: 90
    }, 
    longitude: { 
        type: Number, 
        min: -180, 
        max: 180
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

// export the vendor model to be used by the controllers
const Vendor = mongoose.model("Vendor", vendorSchema)
module.exports = Vendor
