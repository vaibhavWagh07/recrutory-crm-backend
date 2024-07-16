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
router.post("/clients", async (req, res) => {
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
    orgClient.clientVertical = req.body.clientVertical || orgClient.clientVertical;
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


// ----------------------------------------- Candidates wrt Process ----------------------------

// ----------------- PUT FOR PROCESS ---------------------------



// PUT request to update process details other than candidates
router.put('/clients/:clientId/processes/:processId', async (req, res) => {
  try {
    const { clientId, processId } = req.params;


    // Find the client
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Find the process within the client
    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    // Update the process's details based on the request body
    process.clientProcessName = req.body.clientProcessName || process.clientProcessName;
    process.clientProcessLanguage = req.body.clientProcessLanguage || process.clientProcessLanguage;
    process.clientProcessPoc = req.body.clientProcessPoc || process.clientProcessPoc;
    process.interestedCandidates = req.body.interestedCandidates || process.interestedCandidates;
    process.clientProcessCandReq = req.body.clientProcessCandReq || process.clientProcessCandReq;
    process.clientProcessDeadline = req.body.clientProcessDeadline || process.clientProcessDeadline;
    process.clientProcessPckg = req.body.clientProcessPckg || process.clientProcessPckg;
    process.clientProcessLocation = req.body.clientProcessLocation || process.clientProcessLocation;
    process.clientProcessJoining = req.body.clientProcessJoining || process.clientProcessJoining;
    process.clientProcessPerks = req.body.clientProcessPerks || process.clientProcessPerks;
    process.clientProcessJobDesc = req.body.clientProcessJobDesc || process.clientProcessJobDesc;


    // Mark the subdocument as modified
    // client.markModified('clientProcess');

    // Save the parent document after updating process details
    await client.save();

    // Reload the client document to check if the process was updated
    const updatedClient = await ClientSheet.findById(clientId);
    const updatedProcess = updatedClient.clientProcess.id(processId);

    res.status(200).json({ message: 'Process updated successfully', updatedProcess });
  } catch (error) {
    console.error('Error updating process:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// PUT request to update specific candidate details within a process
router.put('/clients/:clientId/processes/:processId/candidates/:candidateId', async (req, res) => {
  try {
    const { clientId, processId, candidateId } = req.params;

    // Find the client
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Find the process within the client
    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    // Find the interested candidate within the process
    const candidate = process.interestedCandidates.id(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in the process' });
    }

    // Update specific fields in the candidate
    candidate.assignedRecruiter = req.body.assignedRecruiter || candidate.assignedRecruiter;
    candidate.status = req.body.status || candidate.status;
    candidate.interested = req.body.interested || candidate.interested;

    // Fields to update in the MasterSheet and other copies
    const fieldsToUpdateInMaster = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      lType: req.body.lType,
      language: req.body.language,
      proficiencyLevel: req.body.proficiencyLevel,
      jbStatus: req.body.jbStatus,
      qualification: req.body.qualification,
      industry: req.body.industry,
      domain: req.body.domain,
      exp: req.body.exp,
      cLocation: req.body.cLocation,
      pLocation: req.body.pLocation,
      currentCTC: req.body.currentCTC,
      expectedCTC: req.body.expectedCTC,
      noticePeriod: req.body.noticePeriod,
      wfh: req.body.wfh,
      resumeLink: req.body.resumeLink,
      linkedinLink: req.body.linkedinLink,
      feedback: req.body.feedback,
      remark: req.body.remark,
      company: req.body.company,
      voiceNonVoice: req.body.voiceNonVoice,
      source: req.body.source
    };

    // Find and update the candidate in the MasterSheet
    const masterCandidate = await Mastersheet.findById(candidate.candidateId);

    if (masterCandidate) {
      Object.assign(masterCandidate, fieldsToUpdateInMaster);
      await masterCandidate.save();

      // Find and update all copies of the candidate in other processes
      const clients = await ClientSheet.find({ 'clientProcess.interestedCandidates.candidateId': candidate.candidateId });

      for (const client of clients) {
        for (const process of client.clientProcess) {
          for (const candidateCopy of process.interestedCandidates) {
            if (candidateCopy.candidateId.toString() === candidate.candidateId.toString()) {
              Object.assign(candidateCopy, fieldsToUpdateInMaster);
            }
          }
        }
        await client.save();
      }
    } else {
      console.warn(`Master candidate with ID ${candidate.candidateId} not found.`);
    }

    // Save the client document after updating candidate details
    await client.save();

    res.status(200).json({ message: 'Candidate details updated successfully', candidate });
  } catch (error) {
    console.error('Error updating candidate details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// PUT request to handle multiple candidates, to assign a common recruiter
router.put('/clients/assign-recruiter/:clientId/:processId', async (req, res) => {
  const { clientId, processId } = req.params;
  const { ids, recruiterId, newAssignedRecruiter } = req.body;

  if (!ids || !recruiterId || !newAssignedRecruiter) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Find the correct process within clientProcess array
    const processToUpdate = client.clientProcess.find(process => process._id.toString() === processId);

    if (!processToUpdate) {
      return res.status(404).json({ message: 'Process not found' });
    }

    // Convert recruiterId to ObjectId
    const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);

    // Convert candidate IDs to ObjectId
    const candidateObjectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    // Update the interestedCandidates array within the found process
    await ClientSheet.updateOne(
      { _id: clientId, 'clientProcess._id': processId, 'clientProcess.interestedCandidates._id': { $in: candidateObjectIds } },
      { $set: { 'clientProcess.$.interestedCandidates.$[candidate].assignedRecruiterId': recruiterObjectId, 'clientProcess.$.interestedCandidates.$[candidate].assignedRecruiter': newAssignedRecruiter } },
      { arrayFilters: [{ 'candidate._id': { $in: candidateObjectIds } }] }
    );

    res.status(200).json({ message: 'Recruiters assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



export default router;
