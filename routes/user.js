import express from "express";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
const secretKey = "secretKey";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
    role,
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});

// Authenticate user function
const authenticateUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  return null;
};

// taking login details
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const payload = { username: user.username, role: user.role };

  jwt.sign(payload, secretKey, { expiresIn: "300s" }, (err, token) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    console.log({ token, role: user.role });
    res.json({ token, role: user.role });
    // res.json({ token });
  });
});

// for accessing the profile
router.post("/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, secretKey, (err, authData) => {
    if (err) {
      res.send({
        message: "Invalid Login",
      });
    } else {
      res.json({
        message: "profile accessed",
        authData,
      });
    }
  });
});

//   for verifying the token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.send({
      result: "invalid login",
    });
  }
}

export default router;
