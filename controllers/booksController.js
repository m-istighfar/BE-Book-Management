const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { successResponse, errorResponse } = require("../utils/response");
const prisma = new PrismaClient();
const redis = require("../config/redis");

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

const invalidateBooksCache = async () => {
  const keys = await redis.keys("getBooks");
  for (const key of keys) {
    await redis.del(key);
  }
};

exports.getBooks = async (req, res) => {
  try {
    const hasQueryParams = Object.keys(req.query).length > 0;
    const cacheKey = `getBooks`;

    if (!hasQueryParams) {
      return redis.get(cacheKey, async (error, cachedData) => {
        if (error) {
          return errorResponse(
            res,
            "Error accessing cache: " + error.message,
            500
          );
        }

        if (cachedData) {
          return successResponse(
            res,
            "Books fetched from cache",
            JSON.parse(cachedData)
          );
        }

        const response = await fetchBooksFromDatabase({});
        redis.setex(cacheKey, 3600, JSON.stringify(response));
        return successResponse(res, "Books fetched successfully", response);
      });
    }

    const response = await fetchBooksFromDatabase(req.query);
    return successResponse(res, "Books fetched successfully", response);
  } catch (error) {
    return errorResponse(res, "Error fetching books: " + error.message, 500);
  }
};

async function fetchBooksFromDatabase(query) {
  const {
    title,
    minYear,
    maxYear,
    minPage,
    maxPage,
    sortByTitle,
    page,
    limit,
  } = query;

  let queryConditions = {};

  if (title) {
    queryConditions.Title = {
      contains: title,
      mode: "insensitive",
    };
  }
  if (minYear) {
    queryConditions.ReleaseYear = {
      ...queryConditions.ReleaseYear,
      gte: parseInt(minYear),
    };
  }
  if (maxYear) {
    queryConditions.ReleaseYear = {
      ...queryConditions.ReleaseYear,
      lte: parseInt(maxYear),
    };
  }
  if (minPage) {
    queryConditions.TotalPage = {
      ...queryConditions.TotalPage,
      gte: parseInt(minPage),
    };
  }
  if (maxPage) {
    queryConditions.TotalPage = {
      ...queryConditions.TotalPage,
      lte: parseInt(maxPage),
    };
  }

  let orderByCondition = {};
  if (sortByTitle) {
    orderByCondition.Title = sortByTitle.toLowerCase();
  }

  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const offset = (pageNumber - 1) * pageSize;

  const books = await prisma.book.findMany({
    where: queryConditions,
    orderBy: orderByCondition,
    skip: offset,
    take: pageSize,
  });

  const totalRecords = await prisma.book.count({
    where: queryConditions,
  });

  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    totalRecords,
    books,
    currentPage: pageNumber,
    totalPages,
  };
}

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

    await invalidateBooksCache();
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

    await invalidateBooksCache();
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

    await invalidateBooksCache();
    successResponse(res, "Book deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting book: " + error.message, 500);
  }
};
