import express from "express";
import mongoose from "mongoose";
import ClientSheet from "../models/Client.js";
import Mastersheet from "../models/Mastersheet.js";
import Users from "../models/Users.js";
import moment from "moment-timezone";

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

// create process and also update the assignProcess field
router.post("/clients/:clientId/process", async (req, res) => {
  const { clientId } = req.params;
  const newProcess = req.body;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Convert dates to IST
    if (newProcess.clientProcessDeadline) {
      newProcess.clientProcessDeadline = moment(
        newProcess.clientProcessDeadline
      )
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
    }
    if (newProcess.clientProcessJoining) {
      newProcess.clientProcessJoining = moment(newProcess.clientProcessJoining)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
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

    console.log(
      "---------------------------Process options is updated after creation of one process------------------------------"
    );

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

    console.log(
      "---------------------------Process options is updated after deletion of one process------------------"
    );
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
router.put("/clients/:clientId/processes/:processId", async (req, res) => {
  try {
    const { clientId, processId } = req.params;

    // Find the client
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Find the process within the client
    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Update the process's details based on the request body
    process.clientProcessName =
      req.body.clientProcessName || process.clientProcessName;
    process.clientProcessLanguage =
      req.body.clientProcessLanguage || process.clientProcessLanguage;
    process.clientProcessPoc =
      req.body.clientProcessPoc || process.clientProcessPoc;
    process.interestedCandidates =
      req.body.interestedCandidates || process.interestedCandidates;
    process.clientProcessCandReq =
      req.body.clientProcessCandReq || process.clientProcessCandReq;

    // Convert dates to IST
    if (req.body.clientProcessDeadline) {
      process.clientProcessDeadline = moment(req.body.clientProcessDeadline)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
    }
    if (req.body.clientProcessJoining) {
      process.clientProcessJoining = moment(req.body.clientProcessJoining)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");
    }

    process.clientProcessPckg =
      req.body.clientProcessPckg || process.clientProcessPckg;
    process.clientProcessLocation =
      req.body.clientProcessLocation || process.clientProcessLocation;

    process.clientProcessPerks =
      req.body.clientProcessPerks || process.clientProcessPerks;
    process.clientProcessJobDesc =
      req.body.clientProcessJobDesc || process.clientProcessJobDesc;

    // Mark the subdocument as modified
    // client.markModified('clientProcess');

    // Save the parent document after updating process details
    await client.save();

    // Reload the client document to check if the process was updated
    const updatedClient = await ClientSheet.findById(clientId);
    const updatedProcess = updatedClient.clientProcess.id(processId);

    res
      .status(200)
      .json({ message: "Process updated successfully", updatedProcess });
  } catch (error) {
    console.error("Error updating process:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// PUT request to update specific candidate details within a process
router.put(
  "/clients/:clientId/processes/:processId/candidates/:candidateId",
  async (req, res) => {
    try {
      const { clientId, processId, candidateId } = req.params;

      // Find the client
      const client = await ClientSheet.findById(clientId);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Find the process within the client
      const process = client.clientProcess.id(processId);

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

      // Update specific fields in the candidate
      candidate.assignedRecruiter =
        req.body.assignedRecruiter || candidate.assignedRecruiter;
      candidate.status = req.body.status || candidate.status;
      candidate.interested = req.body.interested || candidate.interested;

      // Check if the assignProcess field should be enabled or disabled
      if (candidate.status === "Rejected" || candidate.interested !== "interested") {
        candidate.isProcessAssigned = false;
      } else {
        candidate.isProcessAssigned = true;
      }

      // Fields to update in the MasterSheet and other copies
      const fieldsToUpdateInMaster = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        language: req.body.language,
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
        source: req.body.source,
        isProcessAssigned: candidate.isProcessAssigned == false ? false : true,
      };

      // Find and update the candidate in the MasterSheet
      const masterCandidate = await Mastersheet.findById(candidate.candidateId);

      if (masterCandidate) {
        Object.assign(masterCandidate, fieldsToUpdateInMaster);

        console.log("editing in the intCand[] of the process: " + masterCandidate);
        
        await masterCandidate.save();

        // Find and update all copies of the candidate in other processes
        const clients = await ClientSheet.find({
          "clientProcess.interestedCandidates.candidateId":
            candidate.candidateId,
        });

        for (const client of clients) {
          for (const process of client.clientProcess) {
            for (const candidateCopy of process.interestedCandidates) {
              if (
                candidateCopy.candidateId.toString() ===
                candidate.candidateId.toString()
              ) {
                Object.assign(candidateCopy, fieldsToUpdateInMaster);
              }
            }
          }
          await client.save();
        }
      } else {
        console.warn(
          `Master candidate with ID ${candidate.candidateId} not found.`
        );
      }

      // Save the client document after updating candidate details
      await client.save();

      res
        .status(200)
        .json({ message: "Candidate details updated successfully", candidate });
    } catch (error) {
      console.error("Error updating candidate details:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// PUT request to handle multiple candidates, to assign a common recruiter (holds a function call for the updateRecruiterCounts function given below)
router.put(
  "/clients/assign-recruiter/:clientId/:processId",
  async (req, res) => {
    const { clientId, processId } = req.params;
    const { ids, recruiterId, newAssignedRecruiter } = req.body;

    if (!ids || !recruiterId || !newAssignedRecruiter) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    try {
      const client = await ClientSheet.findById(clientId);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Find the correct process within clientProcess array
      const processToUpdate = client.clientProcess.find(
        (process) => process._id.toString() === processId
      );

      if (!processToUpdate) {
        return res.status(404).json({ message: "Process not found" });
      }

      // Convert recruiterId to ObjectId
      const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);

      // Convert candidate IDs to ObjectId
      const candidateObjectIds = ids.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // Get the current date in IST
      const currentDateInIST = moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss");

      // Array to store IDs of candidates already assigned to the same recruiter
      let alreadyAssignedCandidates = [];

      // Iterate over each candidate ID to check and update
      for (let candidateId of candidateObjectIds) {
        const candidate = processToUpdate.interestedCandidates.find(
          (c) => c._id.toString() === candidateId.toString()
        );

        if (candidate) {
          if (candidate.assignedRecruiterId?.equals(recruiterObjectId)) {
            alreadyAssignedCandidates.push(candidate._id.toString());
          } else {
            candidate.assignedRecruiter = newAssignedRecruiter;
            candidate.assignedRecruiterId = recruiterObjectId;
            candidate.assignedRecruiterDate = currentDateInIST;
          }
        }
      }

      // Save the updated client
      await client.save();

      // update the counts in the user schema
      // await updateRecruiterCounts(recruiterId);

      // Prepare response message
      if (alreadyAssignedCandidates.length > 0) {
        res.status(200).json({
          message: "Some candidates were already assigned to this recruiter",
          alreadyAssignedCandidates,
        });
      } else {
        res.status(200).json({ message: "Recruiters assigned successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// update the count dynamically of totalAssigned, totalInterested and totalSelected ((not working so halted it))
// const updateRecruiterCounts = async (recruiterId) => {
//   if (!recruiterId) return;

//   try {
//     // Calculate total assigned candidates
//     const totalAssignedCandidates = await ClientSheet.aggregate([
//       { $unwind: '$clientProcess' },
//       { $unwind: '$clientProcess.interestedCandidates' },
//       { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': new mongoose.Types.ObjectId(recruiterId) } },
//       { $group: { _id: null, totalAssigned: { $sum: 1 } } }
//     ]);

//     const totalAssignedCount = totalAssignedCandidates.length > 0 ? totalAssignedCandidates[0].totalAssigned : 0;
//     console.log('Total Assigned Candidates:', totalAssignedCount);

//     // Calculate total interested amongst assigned
//     const totalInterestedAmongstAssigned = await ClientSheet.aggregate([
//       { $unwind: '$clientProcess' },
//       { $unwind: '$clientProcess.interestedCandidates' },
//       { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': new mongoose.Types.ObjectId(recruiterId), 'clientProcess.interestedCandidates.interested': 'yes' } },
//       { $group: { _id: null, totalInterested: { $sum: 1 } } }
//     ]);

//     const totalInterestedCount = totalInterestedAmongstAssigned.length > 0 ? totalInterestedAmongstAssigned[0].totalInterested : 0;
//     console.log('Total Interested Amongst Assigned:', totalInterestedCount);

//     // Calculate total selected amongst interested
//     const totalSelectedAmongstInterested = await ClientSheet.aggregate([
//       { $unwind: '$clientProcess' },
//       { $unwind: '$clientProcess.interestedCandidates' },
//       { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': new mongoose.Types.ObjectId(recruiterId), 'clientProcess.interestedCandidates.status': 'selected' } },
//       { $group: { _id: null, totalSelected: { $sum: 1 } } }
//     ]);

//     const totalSelectedCount = totalSelectedAmongstInterested.length > 0 ? totalSelectedAmongstInterested[0].totalSelected : 0;
//     console.log('Total Selected Amongst Interested:', totalSelectedCount);

//     // Update the recruiter counts
//     await Users.findByIdAndUpdate(recruiterId, {
//       totalAssignedCandidates: totalAssignedCount,
//       totalInterestedAmongstAssigned: totalInterestedCount,
//       totalSelectedAmongstInterested: totalSelectedCount
//     });

//     console.log(`Updated recruiter ${recruiterId} counts successfully.`);
//   } catch (error) {
//     console.error('Error updating recruiter counts:', error);
//   }
// };

// get all selected candidates
router.get("/selected-candidates", async (req, res) => {
  try {
    // Fetch all clients
    const clients = await ClientSheet.find({});

    // Initialize an array to store selected candidates with enhanced data
    let selectedCandidates = [];

    // Loop through each client and extract selected candidates with additional fields
    clients.forEach((client) => {
      client.clientProcess.forEach((process) => {
        process.interestedCandidates.forEach((candidate) => {
          if (candidate.status === "selected") {
            // Construct additional fields
            const clientId = client._id;
            const clientProcessId = process._id;
            const clientInfo = `${client.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`;

            // Add candidate with enhanced data to the response array
            selectedCandidates.push({
              candidate,
              clientId,
              clientProcessId,
              clientInfo,
            });
          }
        });
      });
    });

    // Return the response with selected candidates and additional fields
    res.status(200).json(selectedCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete candidate from interestedCandidates array
router.delete('/clients/:clientId/process/:processId/candidates/:candidateId', async (req, res) => {
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

    // Find the candidate within the interestedCandidates array
    const candidateIndex = process.interestedCandidates.findIndex(
      (candidate) => candidate.candidateId.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({ message: 'Candidate not found in interestedCandidates' });
    }

    // Remove the candidate from the interestedCandidates array
    process.interestedCandidates.splice(candidateIndex, 1);

    // Update the client document
    await client.save();

    // Optionally, update the candidate's isProcessAssigned field in the Mastersheet
    await Mastersheet.findByIdAndUpdate(candidateId, { isProcessAssigned: false });

    res.status(200).json({ message: 'Candidate removed from interestedCandidates successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  ----------- Language filters API ---------------------------

// adding lang and proficiency filter for seleted candidate
router.get("/selectedFilter", async (req, res) => {
  const { lang, proficiencyLevel } = req.query;

  try {
    // Fetch all clients
    const clients = await ClientSheet.find({});

    // Initialize an array to store selected candidates with enhanced data
    let selectedCandidates = [];

    // Loop through each client and extract selected candidates with additional fields
    clients.forEach((client) => {
      client.clientProcess.forEach((process) => {
        process.interestedCandidates.forEach((candidate) => {
          if (candidate.status === "selected") {
            // Construct additional fields
            const clientId = client._id;
            const clientProcessId = process._id;
            const clientInfo = `${client.clientName} - ${process.clientProcessName} - ${process.clientProcessLanguage}`;

            // Apply language and proficiency filter
            let matchLang = true;
            let matchProficiency = true;

            if (lang) {
              matchLang = candidate.language.some(l => l.lang === lang);
            }

            if (proficiencyLevel) {
              matchProficiency = candidate.language.some(l => proficiencyLevel.split(',').includes(l.proficiencyLevel));
            }

            if (matchLang && matchProficiency) {
              // Add candidate with enhanced data to the response array
              selectedCandidates.push({
                candidate,
                clientId,
                clientProcessId,
                clientInfo,
              });
            }
          }
        });
      });
    });

    // Return the response with selected candidates and additional fields
    res.status(200).json(selectedCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// adding lang and proficiency filter for filtersheet 
router.get("/clients/:clientId/process/:processId/filterLangFilter", async (req, res) => {
  const { clientId, processId } = req.params;
  const { lang, proficiencyLevel } = req.query;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Construct the filter for $elemMatch
    let candidateFilter = candidate => true;

    if (lang || proficiencyLevel) {
      candidateFilter = candidate => {
        const matchLang = lang ? candidate.language.some(l => l.lang === lang) : true;
        const matchProficiency = proficiencyLevel ? candidate.language.some(l => proficiencyLevel.split(',').includes(l.proficiencyLevel)) : true;
        return matchLang && matchProficiency;
      };
    }

    // Filter candidates based on language and proficiency
    const filteredCandidates = process.interestedCandidates.filter(candidate => candidateFilter(candidate));

    res.status(200).json(filteredCandidates);
  } catch (error) {
    console.error("Error filtering candidates:", error);
    res.status(500).json({ message: "Failed to filter candidates", error: error.message });
  }
});

// adding lang and proficiency filter for interested candidate
router.get("/clients/:clientId/process/:processId/interestedlangfilter", async (req, res) => {
  const { clientId, processId } = req.params;
  const { lang, proficiencyLevel } = req.query;

  try {
    const client = await ClientSheet.findById(clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const process = client.clientProcess.id(processId);

    if (!process) {
      return res.status(404).json({ message: "Process not found" });
    }

    // Construct the filter for $elemMatch
    let candidateFilter = candidate => true;

    if (lang || proficiencyLevel) {
      candidateFilter = candidate => {
        const matchLang = lang ? candidate.language.some(l => l.lang === lang) : true;
        const matchProficiency = proficiencyLevel ? candidate.language.some(l => proficiencyLevel.split(',').includes(l.proficiencyLevel)) : true;
        return matchLang && matchProficiency;
      };
    }

    // Filter candidates based on language, proficiency, and interest
    const filteredCandidates = process.interestedCandidates.filter(candidate => {
      return candidate.interested === 'interested' && candidateFilter(candidate);
    });

    res.status(200).json(filteredCandidates);
  } catch (error) {
    console.error("Error filtering candidates:", error);
    res.status(500).json({ message: "Failed to filter candidates", error: error.message });
  }
});





export default router;
