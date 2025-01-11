const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const auth = require("./routes/auth");
const userRoutes = require("./routes/users");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", auth);
app.use("/api/users", userRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Database connection error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
