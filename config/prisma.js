const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    console.log("PrismaClient connected to the database.");
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });

module.exports = prisma;
