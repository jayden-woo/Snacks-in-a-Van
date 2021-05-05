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
    location: {
        type: {
            type: String, 
            enum: ['Point'], 
            required : true, 
            default: 'Point' 
        }, 
        // format: [ longitude (-180 to 180), latitude (-90 to 90) ]
        coordinates: 
            [Number]
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
// create an index for distance querying in the future
vendorSchema.index({location: '2dsphere'})

// export the vendor model to be used by the controllers
const Vendor = mongoose.model("Vendor", vendorSchema)
module.exports = Vendor
