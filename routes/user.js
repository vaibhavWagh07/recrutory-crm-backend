import express from "express";
import "dotenv/config.js";
import jwt from "jsonwebtoken";
const secretKey = "secretKey";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
import Users from "../models/Users.js";
import ClientSheet from "../models/Client.js";
import mongoose from "mongoose";
import Mastersheet from "../models/Mastersheet.js";
import moment from "moment-timezone";

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

  const payload = { username: user.username, role: user.role,_id: user._id.toString() };

  jwt.sign(payload, secretKey, { expiresIn: "300s" }, (err, token) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json({ token,username: user.username, role: user.role,_id: user._id.toString() });
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
router.get('/users-by-role', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const users = await User.find({ role });

    // Create a map where the key is the user ID (as a string) and the value is the username
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user.username;
      return map;
    }, {});

    res.status(200).json(userMap);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
// edit a particular user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Original User:', user);
    console.log('Request Body:', req.body);

    let hashedPassword = user.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    user.username = req.body.username || user.username;
    user.password = hashedPassword;
    user.role = req.body.role || user.role;

    await user.save();

    console.log('Updated User:', user);
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: err.message });
  }
});


// router.put("/users/:id", async (req,res) => {
 
//   try {
    
//     const { id } = req.params;
//     const user = await Users.findById(id);

//     if(!user){
//       res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // crypt the password before updating
//     const orgPassword = req.body.password || user.password;
//     const hashedPassword = await bcrypt.hash(orgPassword, 10);

//     // updating fields
//     user.username = req.body.username || user.username;
//     user.password = hashedPassword;
//     user.role = req.body.role || user.role;

//     // save the user
//     await user.save();

//     res.status(200).json({
//       message: "User Updated Successfully"
//     });

//   } catch (err) {
//     res.status(500).json({message: err.message});
//   }

// })


// ---------------------- user specific properties -------------------------------------

// Fetch candidates assigned to a particular recruiter
router.get('/assigned-candidates', async (req, res) => {
  const { recruiterId } = req.query;
  console.log("recruiter id is: " + recruiterId);

  if (!recruiterId) {
    return res.status(400).json({ message: 'Recruiter ID is required' });
  }

  try {
    const clients = await ClientSheet.find({
      'clientProcess.interestedCandidates.assignedRecruiterId': new mongoose.Types.ObjectId(recruiterId)
    }).populate({
      path: 'clientProcess.interestedCandidates',
      populate: {
        path: 'candidateId',
        select: '_id' // Only include the _id field of candidateId
      }
    });

    const candidates = [];

    clients.forEach(client => {
      client.clientProcess.forEach(process => {
        process.interestedCandidates.forEach(candidate => {
          if (candidate.assignedRecruiterId && candidate.assignedRecruiterId.toString() === recruiterId) {
            console.log("candidate.assignedRecruiterId is: " + candidate.assignedRecruiterId);
            console.log("recruiterId is: " + recruiterId);
            candidates.push({
              candidateId: candidate.candidateId._id, // Include only _id of candidateId
              clientProcessId: process._id, // Include _id of clientProcess
              clientId: client._id, // Include _id of client
              ...candidate._doc,
              assignedProcess: `${client.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`
            });
          }
        });
      });
    });

    console.log("Success");
    res.status(200).json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// filter for candidate assigned to a particular recruiter
router.get('/filterCandidateRecruiter', async (req, res) => {
  const { recruiterId, lang, proficiencyLevel } = req.query;
  console.log("recruiter id is: " + recruiterId);

  if (!recruiterId) {
    return res.status(400).json({ message: 'Recruiter ID is required' });
  }

  try {
    const clients = await ClientSheet.find({
      'clientProcess.interestedCandidates.assignedRecruiterId': new mongoose.Types.ObjectId(recruiterId)
    }).populate({
      path: 'clientProcess.interestedCandidates',
      populate: {
        path: 'candidateId',
        select: '_id' // Only include the _id field of candidateId
      }
    });

    const candidates = [];

    clients.forEach(client => {
      client.clientProcess.forEach(process => {
        process.interestedCandidates.forEach(candidate => {
          if (candidate.assignedRecruiterId && candidate.assignedRecruiterId.toString() === recruiterId) {
            let match = false;

            if (lang && proficiencyLevel) {
              // Both lang and proficiencyLevel are provided
              const proficiencyLevels = proficiencyLevel.split(',');
              match = candidate.language.some(l => l.lang === lang && proficiencyLevels.includes(l.proficiencyLevel));
            } else if (lang) {
              // Only lang is provided
              match = candidate.language.some(l => l.lang === lang);
            } else if (proficiencyLevel) {
              // Only proficiencyLevel is provided
              const proficiencyLevels = proficiencyLevel.split(',');
              match = candidate.language.some(l => proficiencyLevels.includes(l.proficiencyLevel));
            } else {
              // No lang or proficiencyLevel provided
              match = true;
            }

            if (match) {
              candidates.push({
                candidateId: candidate.candidateId._id, // Include only _id of candidateId
                clientProcessId: process._id, // Include _id of clientProcess
                clientId: client._id, // Include _id of client
                ...candidate._doc,
                assignedProcess: `${client.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`
              });
            }
          }
        });
      });
    });

    console.log("Success");
    res.status(200).json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



// PUT request for handling Interested and not interested status by the recruiter 
router.put("/update-status", async (req, res) => {
  const { clientId, clientProcessId, candidateId, interestedStatus } = req.body;

  if (!candidateId || !interestedStatus) {
    return res
      .status(400)
      .json({ message: "Candidate ID and interestedStatus are required" });
  }

  try {
    // Find the client
    const client = await ClientSheet.findById(clientId);
    console.log("client id is: " + clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Find the process within the client
    const process = client.clientProcess.id(clientProcessId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Find the interested candidate within the process
    const candidate = process.interestedCandidates.id(candidateId);

    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found in the process" });
    }

    const oldInterestedStatus = candidate.interested;
    candidate.interested = interestedStatus;

    if (
      interestedStatus === "interested" &&
      oldInterestedStatus !== "interested"
    ) {
      candidate.markedInterestedDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
    } 
    else if (interestedStatus !== "interested") {
      candidate.interested = null;
      candidate.markedInterestedDate = null;
      if (candidate.feedback === "" || candidate.remark === "") {
        return res.status(404).json({
          message:
            "Please provide the feedback and remark for not being interested",
        });
      } 
      else {
        // Move remark and feedback to Mastersheet
        const mastersheetCandidate = await Mastersheet.findById(
          candidate.candidateId
        );

        if (mastersheetCandidate) {
          mastersheetCandidate.remark = candidate.remark;
          mastersheetCandidate.feedback = candidate.feedback;
          mastersheetCandidate.isProcessAssigned = false;
          await mastersheetCandidate.save();
          await candidate.deleteOne();
        } 
        else {
          console.error(
            "Mastersheet candidate not found for ID:",
            candidate.candidateId
          );
        }
      }
    }

    // save the client irrespective of the update being interested or not interested
    await client.save();


    res
      .status(200)
      .json({ message: "Candidate interest status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});







export default router;
