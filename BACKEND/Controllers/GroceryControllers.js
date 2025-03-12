const Grocery = require("../Model/GroceryModel");

// Get all groceries
const getAllGroceries = async (req, res) => {
  try {
    const groceries = await Grocery.find();
    res.status(200).json({ count: groceries.length, data: groceries });
  } catch (err) {
    console.error("Error fetching groceries:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new grocery
const addGrocery = async (req, res) => {
  try {
    const newGrocery = new Grocery(req.body);
    await newGrocery.save();
    res.status(201).json(newGrocery);
  } catch (err) {
    console.error("Error adding grocery:", err);
    res.status(400).json({ message: err.message });
  }
};

// Get single grocery
const getGroceryById = async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    if (!grocery) return res.status(404).json({ message: "Grocery not found" });
    res.json(grocery);
  } catch (err) {
    console.error("Error fetching grocery:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update grocery
const updateGrocery = async (req, res) => {
  try {
    const updatedGrocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedGrocery) return res.status(404).json({ message: "Grocery not found" });
    res.json(updatedGrocery);
  } catch (err) {
    console.error("Error updating grocery:", err);
    res.status(400).json({ message: err.message });
  }
};

// Delete grocery
const deleteGrocery = async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndDelete(req.params.id);
    if (!grocery) return res.status(404).json({ message: "Grocery not found" });
    res.json({ message: "Grocery removed" });
  } catch (err) {
    console.error("Error deleting grocery:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllGroceries,
  addGrocery,
  getGroceryById,
  updateGrocery,
  deleteGrocery
};