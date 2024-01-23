require("dotenv").config();

const redis = require("./config/redis");
const prisma = require("./config/prisma");
const cors = require("cors");

const express = require("express");

const authMiddleware = require("./middleware/authenticationMiddleware");
const errorFormatter = require("./middleware/errorFormatter");
const applyMiddleware = require("./middleware/index");

const authRoutes = require("./routes/authRoutes");

const app = express();
applyMiddleware(app);

app.use("/auth", authRoutes);

app.use(errorFormatter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
