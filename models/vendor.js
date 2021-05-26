const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const SALT_WORK_FACTOR = 10

// define the schema for a vendor in the vendors database
const vendorSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required : 'Username is required', 
        unique: true, 
        trim: true
    }, 
    password: {
        type: String, 
        required : 'Password is required', 
        trim: true
    }, 
    isOnline: {
        type: Boolean, 
        required : true, 
        default: false
    }, 
    location: {
        type: {
            type: String, 
            enum: ['Point']
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

// generate a hash for the password
vendorSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null)
}

// check if password is valid
vendorSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

// TODO:
// Implement user lockout for too many wrong password attempts

// compile the schema into a model
const Vendor = mongoose.model("Vendor", vendorSchema)

// export the model to be used by other files
module.exports = Vendor
