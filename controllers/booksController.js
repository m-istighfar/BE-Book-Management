const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { successResponse, errorResponse } = require("../utils/response");
const prisma = new PrismaClient();

const validateBook = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string().required(),
    releaseYear: Joi.number().integer().min(1980).max(2021).required(),
    price: Joi.string().required(),
    totalPage: Joi.number().integer().required(),
    categoryID: Joi.number().integer().required(),
  });

  const { error } = schema.validate(data, { abortEarly: false });
  return error
    ? error.details.map((detail) => detail.message).join(", ")
    : null;
};

const determineThickness = (totalPage) => {
  if (totalPage <= 100) {
    return "tipis";
  } else if (totalPage <= 200) {
    return "sedang";
  } else {
    return "tebal";
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    successResponse(res, "Books fetched successfully", books);
  } catch (error) {
    errorResponse(res, "Error fetching books: " + error.message, 500);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { BookID: parseInt(id) },
    });

    if (!book) {
      return errorResponse(res, "Book not found", 404);
    }

    successResponse(res, "Book fetched successfully", book);
  } catch (error) {
    errorResponse(res, "Error fetching book: " + error.message, 500);
  }
};

exports.createBook = async (req, res) => {
  try {
    const validationError = validateBook(req.body);
    if (validationError) {
      return errorResponse(res, validationError);
    }

    const {
      title,
      description,
      imageUrl,
      releaseYear,
      price,
      totalPage,
      categoryID,
    } = req.body;

    const thickness = determineThickness(totalPage);

    const existingBook = await prisma.book.findUnique({
      where: { Title: title },
    });
    if (existingBook) {
      return errorResponse(res, "A book with this title already exists", 400);
    }

    const categoryExists = await prisma.category.findUnique({
      where: { CategoryID: categoryID },
    });
    if (!categoryExists) {
      return errorResponse(res, "Category not found", 404);
    }

    const newBook = await prisma.book.create({
      data: {
        Title: title,
        Description: description,
        ImageUrl: imageUrl,
        ReleaseYear: releaseYear,
        Price: price,
        TotalPage: totalPage,
        CategoryID: categoryID,
        Thickness: thickness,
      },
    });

    successResponse(res, "Book created successfully", newBook, 201);
  } catch (error) {
    errorResponse(res, "Error creating book: " + error.message, 500);
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const validationError = validateBook(req.body);
    if (validationError) {
      return errorResponse(res, validationError);
    }

    const bookExists = await prisma.book.findUnique({
      where: { BookID: parseInt(id) },
    });
    if (!bookExists) {
      return errorResponse(res, "Book not found", 404);
    }

    const {
      title,
      description,
      imageUrl,
      releaseYear,
      price,
      totalPage,
      categoryID,
    } = req.body;
    const thickness = determineThickness(totalPage);

    const existingBookWithTitle = await prisma.book.findFirst({
      where: { Title: title, NOT: { BookID: parseInt(id) } },
    });
    if (existingBookWithTitle) {
      return errorResponse(
        res,
        "Another book with this title already exists",
        400
      );
    }

    const categoryExists = await prisma.category.findUnique({
      where: { CategoryID: categoryID },
    });
    if (!categoryExists) {
      return errorResponse(res, "Category not found", 404);
    }

    const updatedBook = await prisma.book.update({
      where: { BookID: parseInt(id) },
      data: {
        Title: title,
        Description: description,
        ImageUrl: imageUrl,
        ReleaseYear: releaseYear,
        Price: price,
        TotalPage: totalPage,
        CategoryID: categoryID,
        Thickness: thickness,
      },
    });

    successResponse(res, "Book updated successfully", updatedBook);
  } catch (error) {
    errorResponse(res, "Error updating book: " + error.message, 500);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const bookExists = await prisma.book.findUnique({
      where: { BookID: parseInt(id) },
    });
    if (!bookExists) {
      return errorResponse(res, "Book not found", 404);
    }

    await prisma.book.delete({
      where: { BookID: parseInt(id) },
    });

    successResponse(res, "Book deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting book: " + error.message, 500);
  }
};
