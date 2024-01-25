const { PrismaClient } = require("@prisma/client");
const faker = require("faker");

const prisma = new PrismaClient();

const existingCategoryNames = new Set();

const createCategories = async (count) => {
  const categories = [];
  for (let i = 0; i < count; i++) {
    let categoryName;
    do {
      categoryName = faker.lorem.word();
    } while (existingCategoryNames.has(categoryName));
    existingCategoryNames.add(categoryName);

    const category = await prisma.category.create({
      data: {
        Name: categoryName,
      },
    });
    categories.push(category);
  }
  return categories;
};

const createBooks = async (count, categories) => {
  const books = [];
  for (let i = 0; i < count; i++) {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const book = await prisma.book.create({
      data: {
        Title: faker.lorem.words(3),
        Description: faker.lorem.paragraph(),
        ImageUrl: faker.image.imageUrl(),
        ReleaseYear: faker.datatype.number({ min: 1970, max: 2021 }),
        Price: faker.commerce.price(),
        TotalPage: faker.datatype.number({ min: 100, max: 500 }),
        Thickness: faker.random.arrayElement(["tipis", "sedang", "tebal"]),
        Category: {
          connect: {
            CategoryID: randomCategory.CategoryID,
          },
        },
      },
    });
    books.push(book);
  }
  return books;
};

const seedData = async () => {
  try {
    const categories = await createCategories(10);
    const books = await createBooks(500, categories);
    console.log("Seed data created successfully.");
  } catch (error) {
    console.error("Failed to create seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedData();
