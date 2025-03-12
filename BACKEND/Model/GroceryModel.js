const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GrocerySchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: [true, "Grocery item name is required"],
    maxlength: [100, "Item name cannot exceed 100 characters"]
  },
  category: {
    type: String,
    enum: ["Dairy", "Produce", "Meat", "Bakery", "Pantry", "Frozen", 
          "Beverages", "Snacks", "Household", "Other"],
    default: "Other"
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"]
  },
  expiryDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["Available", "Finished"],
    default: "Available"
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  purchasedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Grocery", GrocerySchema);