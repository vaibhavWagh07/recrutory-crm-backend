import express from "express";
import mongoose from "mongoose";
import ClientSheet from "../models/Client.js";
import Mastersheet from "../models/Mastersheet.js";

const router = express.Router();

// checking api
router.get("/", (req, res) => {
  res.status(200).send({
    msg: "Client's APIs are working perfectly",
  });
});

// -------------------------------------- client ---------------------------------------

// creating new client
router.post("/create", async (req, res) => {
  try {
    const { clientName, clientVertical, clientPoc } = req.body;

    const client = new ClientSheet({
      clientName,
      clientVertical,
      clientPoc,
      clientProcess: [], // Initially empty
    });

    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// get all clients
router.get("/clients", async (req, res) => {
  try {
    const clients = await ClientSheet.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all processes across all clients
router.get("/clients/processes", async (req, res) => {
  try {
    const clients = await ClientSheet.find();
    let allProcesses = [];

    clients.forEach((client) => {
      allProcesses = allProcesses.concat(client.clientProcess);
    });

    res.status(200).json(allProcesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get client by id
router.get("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await ClientSheet.findById(id);
    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// delete client by id
router.delete("/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientSheet.findById(id);

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }
    await client.deleteOne();
    res.json({ message: "Client Deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// update client by id
router.put("/clients/:id", async (req, res) => {
  try {
    let { id } = req.params;

    // Trim any leading colons or other characters from the ID
    id = id.replace(/^:/, "");

    // Check if the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid client ID: ${id}`);
      return res.status(400).json({
        message: "Invalid client id",
      });
    }

    const orgClient = await ClientSheet.findById(id);

    orgClient.clientName = req.body.clientName || orgClient.clientName;
    orgClient.clientVertical =
      req.body.clientVertical || orgClient.clientVertical;
    orgClient.clientPoc = req.body.clientPoc || orgClient.clientPoc;
    orgClient.clientProcess = req.body.clientProcess || orgClient.clientProcess;

    const updatedClient = await orgClient.save();
    res.json(updatedClient);
    console.log("Updated client is: " + updatedClient);
  } catch (error) {
    console.log("Error while updating the client");
    res.status(400).json({
      message: error.message,
    });
  }
});

// ----------------------------------------- process ------------------------------------------

// candidates edit option is to be added here

// create process and also update the assignProcess field
router.post("/clients/:clientId/process", async (req, res) => {
  const { clientId } = req.params;
  const newProcess = req.body;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.clientProcess.push(newProcess);
    await client.save();

    // Get all active processes across all clients
    const allClients = await ClientSheet.find();
    let activeProcesses = [];

    allClients.forEach((client) => {
      client.clientProcess.forEach((process) => {
        activeProcesses.push({
          clientName: client.clientName,
          clientProcessName: process.clientProcessName,
          clientProcessLanguage: process.clientProcessLanguage,
        });
      });
    });

    // Update assignProcess field for all candidates
    const processInfoList = activeProcesses.map(
      (process) =>
        `${process.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`
    );

    console.log("---------------------------Process options is updated after creation of one process------------------------------");

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all processess of particular client
router.get("/clients/:clientId/processes", async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client.clientProcess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get process by id
router.get("/clients/:clientId/process/:processId", async (req, res) => {
  const { clientId, processId } = req.params;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    res.status(200).json(process);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete process by id
router.delete("/clients/:clientId/process/:processId", async (req, res) => {
  const { clientId, processId } = req.params;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    process.deleteOne();
    await client.save();

    // Get all active processes across all clients
    const allClients = await ClientSheet.find();
    let activeProcesses = [];

    allClients.forEach((client) => {
      client.clientProcess.forEach((process) => {
        activeProcesses.push({
          clientName: client.clientName,
          clientProcessName: process.clientProcessName,
          clientProcessLanguage: process.clientProcessLanguage,
        });
      });
    });

    // Update assignProcess field for all candidates
    const processInfoList = activeProcesses.map(
      (process) =>
        `${process.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`
    );

    console.log("---------------------------Process options is updated after deletion of one process------------------");
    res.status(200).json({ message: "Process deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to fetch assignProcess options to be used in the frontend
router.get("/process-options", async (req, res) => {
  try {

    // Get all active processes across all clients
    const allClients = await ClientSheet.find();
    let activeProcesses = [];

    allClients.forEach((client) => {
      client.clientProcess.forEach((process) => {
        activeProcesses.push({
          clientName: client.clientName,
          clientProcessName: process.clientProcessName,
          clientProcessLanguage: process.clientProcessLanguage,
        });
      });
    });

    // Format active processes into unique identifiers
    const processInfoList = activeProcesses.map(
      (process) =>
        `${process.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`
    );

    res.status(200).json([...new Set(processInfoList)]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




export default router;

// ------------- PUT LOGIC FOR THE CLIENT

// working fine, but if added new one, it's replacing the previous data so numerical change is happening
// router.put("/clients/:id", async (req, res) => {
//   let { id } = req.params;

//   // Trim any leading colons or other characters from the ID
//   id = id.replace(/^:/, '');

//   // Check if the provided id is a valid ObjectId
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     console.log(`Invalid client ID: ${id}`);
//     return res.status(400).json({
//       message: "Invalid client id",
//     });
//   }

//   const { clientName, clientVertical, clientPoc, clientProcess } = req.body;

//   try {
//     const updateFields = {};

//     if (clientName) updateFields.clientName = clientName;
//     if (clientVertical) updateFields.clientVertical = clientVertical;

//     if (clientPoc) {
//       updateFields.clientPoc = clientPoc.map(poc => {
//         const isValid = mongoose.Types.ObjectId.isValid(poc._id);
//         console.log(`Processing POC ID: ${poc._id}, isValid: ${isValid}`);
//         return {
//           ...poc,
//           _id: isValid ? new mongoose.Types.ObjectId(poc._id) : new mongoose.Types.ObjectId()
//         };
//       });
//     }

//     if (clientProcess) {
//       updateFields.clientProcess = clientProcess.map(process => {
//         const isValid = mongoose.Types.ObjectId.isValid(process._id);
//         console.log(`Processing Process ID: ${process._id}, isValid: ${isValid}`);
//         return {
//           ...process,
//           _id: isValid ? new mongoose.Types.ObjectId(process._id) : new mongoose.Types.ObjectId()
//         };
//       });
//     }

//     const updatedClient = await ClientSheet.findByIdAndUpdate(id, { $set: updateFields }, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedClient) {
//       return res.status(404).json({
//         message: "Client not found",
//       });
//     }

//     res.status(200).json(updatedClient);
//   } catch (error) {
//     console.error(`Error updating client: ${error.message}`);
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });
