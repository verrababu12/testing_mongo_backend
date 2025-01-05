const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const TestingModel = require("./modules/Users");

const app = express();

app.use(express.json());
app.use(cors());

dotenv.config();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connection successful!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Start Server
app.listen(3001, () => {
  console.log("Server Running at http://localhost:3001");
});

// Welcome Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Register User
app.post("/api/register", async (req, res) => {
  const { username, name, email, password } = req.body;
  const existingUser = await TestingModel.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new TestingModel({
    username,
    name,
    email,
    password: hashedPassword,
  });
  await newUser.save();
  res.status(201).json({ message: "User Created Successfully" });
});

// Login User
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await TestingModel.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token });
});

// Get All Users
app.get("/api/users", async (req, res) => {
  const users = await TestingModel.find();
  res.json(users);
});

// Update User
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await TestingModel.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete User
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await TestingModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
