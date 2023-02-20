const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SALT_WORK_FACTOR = 10;

// Define the schema for a customer in the customers database
const customerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: "Email address is required",
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: "Password is required",
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
  {
    versionKey: false,
  },
  {
    collection: "customers",
  }
);

// Generate a hash for the password
customerSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
};

// Check if password is valid
customerSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// TODO:
// Implement user lockout for too many wrong password attempts

// Compile the schema into a model
const Customer = mongoose.model("Customer", customerSchema);

// Export the model to be used by other files
module.exports = Customer;
