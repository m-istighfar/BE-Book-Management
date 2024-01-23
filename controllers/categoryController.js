const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const { successResponse, errorResponse } = require("../utils/response");
const prisma = new PrismaClient();

const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
  });

  const { error } = schema.validate(data, { abortEarly: false });
  return error
    ? error.details.map((detail) => detail.message).join(", ")
    : null;
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    successResponse(res, "Categories fetched successfully", categories);
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

    successResponse(res, "Category deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting category: " + error.message, 500);
  }
};
