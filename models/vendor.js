const mongoose = require("mongoose")

// define the schema for a vendor in the vendors database
const vendorSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true
    }, 
    isOnline: {
        type: Boolean, 
        required : true,
        default: false
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
    textAddress: { 
        type: String
    }
}, {
    timestamps: true
}, {
    versionKey: false
}, {
    collection: 'vendors' 
})

// export the vendor model to be used by the controllers
const Vendor = mongoose.model("Vendor", vendorSchema)
module.exports = Vendor
