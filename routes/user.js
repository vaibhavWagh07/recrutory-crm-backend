import express from "express";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
const secretKey = "secretKey";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
import Users from "../models/Users.js";
const router = express.Router();


// ---------------------- SIGN UP AND LOGIN ----------------------------------------

// creating the user
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
    assignedCandidatesId: [],
    
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



// ------------------- user's general properties': -------------------------------------------

// Fetch users by role
router.get("/users-by-role", async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  try {
    const users = await User.find({ role });

    // Create a map where the key is the user ID and the value is the username
    const userMap = users.reduce((map, user) => {
      map[user._id] = user.username;
      return map;
    }, {});

    res.status(200).json(userMap);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// get all the users
router.get("/users", async (req,res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: err.message
    });
  }
})

// get user by id
router.get("/users/:id", async (req,res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);

    if(!user){
      res.status(404).json({message: "User not found"});
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
})

// delete a particular user
router.delete("/users/:id", async (req,res) => {
  try {
    const {id} = req.params;
    const user = await Users.findById(id);

    if(!user){
      return res.status(404).json({
        message: "User not found"
      });
    }

    await user.deleteOne();
    res.json({
      message: "User Deleted Successfully"
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
})

// edit a particular user
router.put("/users/:id", async (req,res) => {
 
  try {
    
    const { id } = req.params;
    const user = await Users.findById(id);

    if(!user){
      res.status(404).json({
        message: "User not found"
      });
    }

    // crypt the password before updating
    const orgPassword = req.body.password || user.password;
    const hashedPassword = await bcrypt.hash(orgPassword, 10);

    // updating fields
    user.username = req.body.username || user.username;
    user.password = hashedPassword;
    user.role = req.body.role || user.role;

    // save the user
    await user.save();

    res.status(200).json({
      message: "User Updated Successfully"
    });

  } catch (err) {
    res.status(500).json({message: err.message});
  }

})




// ---------------------- user specific properties -------------------------------------








export default router;
