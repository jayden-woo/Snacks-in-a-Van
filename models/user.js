const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const SALT_WORK_FACTOR = 10

// define the schema for a user which could be a customer or vendor
const userSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: 'Email address is required', 
        unique: true,
        trim: true, 
        lowercase: true, 
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    }
}, {
    versionKey: false
}, {
    collection: 'users' 
})

// automatically hash the password before storing it in the database
// Ref: https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
userSchema.pre('save', function(next) {
    let user = this
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt to be hashed with the password
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash
            next()
        })
    })
})

// compare the given password with the password stored in the database
userSchema.methods.comparePassword = function(givenPassword, callback) {
    bcrypt.compare(givenPassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch)
    })
}

// export the user model to be used in the customer and vendor models
const User = mongoose.model("User", userSchema)
module.exports = User
