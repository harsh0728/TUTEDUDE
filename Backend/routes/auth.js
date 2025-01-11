const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register route - User Sign Up
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      // Create a new user
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      console.error("Registration error:", err); // Log the error
      res.status(500).json({ error: "An error occurred during registration" });
    }
  });
  

// Login route - User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    // Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token expiration time
    });

    // Return the token and user data
    res.json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during login" });
  }
});

module.exports = router;
