const mongoose = require("mongoose");

// Define the schema for one line of snacks to be used in the order schema
const orderLineSchema = new mongoose.Schema({
  snackID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Snack",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

// Define the schema for optional feedbacks from customer
const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
});

// Define the schema for one order in the orders database
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 0,
    },
    vendorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["Placed", "Fulfilled", "Picked-Up", "Cancelled"],
      default: "Placed",
      required: true,
    },
    snacks: [orderLineSchema],
    total: {
      type: Number,
      min: 0,
      required: true,
    },
    discountApplied: {
      type: Boolean,
      default: false,
    },
    feedback: feedbackSchema,
  },
  {
    timestamps: true,
  },
  {
    versionKey: false,
  },
  {
    collection: "orders",
  }
);

// Compile the schemas into models
const OrderLine = mongoose.model("OrderLine", orderLineSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const Order = mongoose.model("Order", orderSchema);

// Export the models to be used by other files
module.exports = {
  OrderLine,
  Feedback,
  Order,
};
