const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");
const authMiddleware = require("../middleware/authenticationMiddleware");

router.get("/", booksController.getBooks);

router.get("/:id", booksController.getBookById);

router.post("/", authMiddleware, booksController.createBook);

router.patch("/:id", authMiddleware, booksController.updateBook);

router.delete("/:id", authMiddleware, booksController.deleteBook);

module.exports = router;
