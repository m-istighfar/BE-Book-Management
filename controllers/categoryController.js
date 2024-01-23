const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { successResponse, errorResponse } = require("../utils/response");
const prisma = new PrismaClient();
const redis = require("../config/redis");

const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
  });

  const { error } = schema.validate(data, { abortEarly: false });
  return error
    ? error.details.map((detail) => detail.message).join(", ")
    : null;
};

const invalidateCategoryRelatedCache = async (categoryId) => {
  const categoryKeys = await redis.keys("getCategories");
  for (const key of categoryKeys) {
    await redis.del(key);
  }

  if (categoryId) {
    const bookKeys = await redis.keys(`getBooksByCategory:${categoryId}`);
    for (const key of bookKeys) {
      await redis.del(key);
    }
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const cacheKey = `getCategories`;

    redis.get(cacheKey, async (error, cachedData) => {
      if (error) throw error;

      if (cachedData) {
        return successResponse(
          res,
          "Categories fetched from cache",
          JSON.parse(cachedData)
        );
      } else {
        const totalRecords = await prisma.category.count();
        const totalPages = Math.ceil(totalRecords / pageSize);

        const categories = await prisma.category.findMany({
          skip: offset,
          take: pageSize,
        });

        const response = {
          totalRecords,
          categories,
          currentPage: pageNumber,
          totalPages,
        };

        redis.setex(cacheKey, 3600, JSON.stringify(response));

        successResponse(res, "Categories fetched successfully", response);
      }
    });
  } catch (error) {
    errorResponse(res, "Error fetching categories: " + error.message, 500);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { CategoryID: parseInt(id) },
    });

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    successResponse(res, "Category fetched successfully", category);
  } catch (error) {
    errorResponse(res, "Error fetching category: " + error.message, 500);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const validationError = validateCategory(req.body);
    if (validationError) {
      return errorResponse(res, validationError);
    }

    const { name } = req.body;
    const existingCategory = await prisma.category.findUnique({
      where: { Name: name },
    });

    if (existingCategory) {
      return errorResponse(res, "Category already exists", 400);
    }

    const newCategory = await prisma.category.create({
      data: { Name: name },
    });
    await invalidateCategoryRelatedCache();
    successResponse(res, "Category created successfully", newCategory, 201);
  } catch (error) {
    errorResponse(res, "Error creating category: " + error.message, 500);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const validationError = validateCategory(req.body);
    if (validationError) {
      return errorResponse(res, validationError);
    }

    const categoryExists = await prisma.category.findUnique({
      where: { CategoryID: parseInt(id) },
    });
    if (!categoryExists) {
      return errorResponse(res, "Category not found", 404);
    }

    const existingCategoryWithName = await prisma.category.findFirst({
      where: {
        Name: name,
        NOT: {
          CategoryID: parseInt(id),
        },
      },
    });
    if (existingCategoryWithName) {
      return errorResponse(res, "Category with this name already exists", 400);
    }

    const updatedCategory = await prisma.category.update({
      where: { CategoryID: parseInt(id) },
      data: { Name: name },
    });
    await invalidateCategoryRelatedCache(parseInt(id));
    successResponse(res, "Category updated successfully", updatedCategory);
  } catch (error) {
    errorResponse(res, "Error updating category: " + error.message, 500);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryExists = await prisma.category.findUnique({
      where: { CategoryID: parseInt(id) },
    });
    if (!categoryExists) {
      return errorResponse(res, "Category not found", 404);
    }

    await prisma.category.delete({
      where: { CategoryID: parseInt(id) },
    });
    await invalidateCategoryRelatedCache(parseInt(id));
    successResponse(res, "Category deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting category: " + error.message, 500);
  }
};

exports.getBooksByCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      minYear,
      maxYear,
      minPage,
      maxPage,
      sortByTitle,
      page,
      limit,
    } = req.query;

    const cacheKey = `getBooksByCategory:${id}`;

    redis.get(cacheKey, async (error, cachedData) => {
      if (error) throw error;

      if (cachedData) {
        return successResponse(
          res,
          "Books fetched from cache",
          JSON.parse(cachedData)
        );
      } else {
        let queryConditions = {
          CategoryID: parseInt(id),
        };

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
          include: {
            Category: true,
          },
        });

        const totalRecords = await prisma.book.count({
          where: queryConditions,
        });

        const totalPages = Math.ceil(totalRecords / pageSize);

        const response = {
          totalRecords,
          books,
          currentPage: pageNumber,
          totalPages,
        };

        redis.setex(cacheKey, 3600, JSON.stringify(response));

        successResponse(res, "Books fetched successfully", response);
      }
    });
  } catch (error) {
    errorResponse(res, "Error fetching books: " + error.message, 500);
  }
};
