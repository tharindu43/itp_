require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express(); 

// Routes
const groceryRoutes = require("./Routes/GroceryRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5001, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/groceries", groceryRoutes);

// Health Check
app.get('/', (req, res) => res.send('API Running'));