const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authenticationMiddleware");

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", authMiddleware, categoryController.createCategory);
router.patch("/:id", authMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);
router.get("/:id/books", categoryController.getBooksByCategoryId);

module.exports = router;
