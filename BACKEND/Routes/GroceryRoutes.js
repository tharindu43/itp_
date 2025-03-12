const express = require("express");
const router = express.Router();
const groceryController = require("../Controllers/GroceryControllers");

router.get("/", groceryController.getAllGroceries);
router.post("/", groceryController.addGrocery);
router.get("/:id", groceryController.getGroceryById);
router.put("/:id", groceryController.updateGrocery);
router.delete("/:id", groceryController.deleteGrocery);

module.exports = router;