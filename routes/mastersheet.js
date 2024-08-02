import express from "express";
import "dotenv/config.js";
import Mastersheet from "../models/Mastersheet.js";
import ClientSheet from "../models/Client.js";

const router = express.Router();

// checking api
router.get("/", (req, res) => {
  res.status(200).send({
    msg: "Mastersheet's APIs are working successfully",
  });
});

// Create a new candidate
router.post("/candidates", async (req, res) => {
  try {
    const candidate = new Mastersheet({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      status: req.body.status || null,
      assignProcess: req.body.assignProcess || null,
      interested: req.body.interested || null,
      assignedRecruiter: req.body.assignedRecruiter || null,
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
    });

    const newCandidate = await candidate.save();
    console.log("New Candidate is: " + newCandidate);
    res.status(201).json(newCandidate);
  } catch (err) {
    console.error("Error saving the Candidate:", err);
    res
      .status(500)
      .json({ message: "Failed to create candidate", error: err.message });
  }
});

// GET all candidates
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Mastersheet.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET candidate by id
router.get("/candidates/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const candidate = await Mastersheet.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET candidate after filtering the language
router.get("/langfilter", async (req, res) => {
  try {
    const { lang, proficiencyLevel } = req.query;

    // Construct the filter for $elemMatch
    let filter = {};

    if (lang || proficiencyLevel) {
      filter.language = { $elemMatch: {} };

      if (lang) {
        filter.language.$elemMatch.lang = lang;
      }

      if (proficiencyLevel) {
        const proficiencyLevels = proficiencyLevel.split(","); // Split the comma-separated proficiency levels
        filter.language.$elemMatch.proficiencyLevel = {
          $in: proficiencyLevels,
        };
      }
    }

    // Log the constructed filter for debugging
    console.log("Constructed filter:", filter);

    // Perform the query with the constructed filter
    const candidates = await Mastersheet.find(filter);
    res.json(candidates);
  } catch (err) {
    console.error("Error filtering candidates:", err);
    res
      .status(500)
      .json({ message: "Failed to filter candidates", error: err.message });
  }
});

// DELETE candidate by id
router.delete("/candidates/:id", async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidate = await Mastersheet.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Fetch all clients
    const clients = await ClientSheet.find();

    // Iterate through clients and their processes to remove candidate from interestedCandidates[]
    for (const client of clients) {
      let isModified = false;
      for (const process of client.clientProcess) {
        // Remove the candidate from interestedCandidates[] if present
        const initialLength = process.interestedCandidates.length;
        process.interestedCandidates = process.interestedCandidates.filter(
          (intCand) => String(intCand.candidateId) !== candidateId
        );
        if (process.interestedCandidates.length !== initialLength) {
          isModified = true;
          console.log(
            `Removed candidate ${candidateId} from process ${process.clientProcessName}`
          );
        }
      }
      if (isModified) {
        await client.save(); // Save changes only if there was a removal
      }
    }

    // Delete the candidate from the MasterSheet
    await candidate.deleteOne();

    res.json({
      message:
        "Candidate deleted successfully along with all its copies in the processes",
    });
    console.log("Delete candidate and its copies from processes");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT and shifting candidate to the intCandidate[] of the process from the edit button at the end
router.put("/candidates/:id", async (req, res) => {
  try {
    const candidate = await Mastersheet.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const newAssignProcess = req.body.assignProcess || candidate.assignProcess;
    const isAssignProcessChanged = newAssignProcess !== candidate.assignProcess;

    // Updating candidate with new entries
    candidate.name = req.body.name || candidate.name;
    candidate.email = req.body.email || candidate.email;
    candidate.phone = req.body.phone || candidate.phone;
    candidate.status = req.body.status || candidate.status;
    candidate.assignProcess = newAssignProcess;
    candidate.interested = req.body.interested || candidate.interested;
    candidate.assignedRecruiter =
      req.body.assignedRecruiter || candidate.assignedRecruiter;
    candidate.language = req.body.language || candidate.language;
    candidate.jbStatus = req.body.jbStatus || candidate.jbStatus;
    candidate.qualification = req.body.qualification || candidate.qualification;
    candidate.industry = req.body.industry || candidate.industry;
    candidate.domain = req.body.domain || candidate.domain;
    candidate.exp = req.body.exp || candidate.exp;
    candidate.cLocation = req.body.cLocation || candidate.cLocation;
    candidate.pLocation = req.body.pLocation || candidate.pLocation;
    candidate.currentCTC = req.body.currentCTC || candidate.currentCTC;
    candidate.expectedCTC = req.body.expectedCTC || candidate.expectedCTC;
    candidate.noticePeriod = req.body.noticePeriod || candidate.noticePeriod;
    candidate.wfh = req.body.wfh || candidate.wfh;
    candidate.resumeLink = req.body.resumeLink || candidate.resumeLink;
    candidate.linkedinLink = req.body.linkedinLink || candidate.linkedinLink;
    candidate.feedback = req.body.feedback || candidate.feedback;
    candidate.remark = req.body.remark || candidate.remark;
    candidate.company = req.body.company || candidate.company;
    candidate.voiceNonVoice = req.body.voiceNonVoice || candidate.voiceNonVoice;
    candidate.source = req.body.source || candidate.source;

    if (isAssignProcessChanged) {
      // If assignProcess is changed
      console.log("AssignProcess changed");
      const [clientName, processName, processLanguage] =
        newAssignProcess.split(" - ");

      const client = await ClientSheet.findOne({
        clientName,
        "clientProcess.clientProcessName": processName,
        "clientProcess.clientProcessLanguage": processLanguage,
      });

      if (client) {
        const process = client.clientProcess.find(
          (p) =>
            p.clientProcessName === processName &&
            p.clientProcessLanguage === processLanguage
        );

        const newCandidate = {
          candidateId: candidate._id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          language: candidate.language,
          jbStatus: candidate.jbStatus,
          qualification: candidate.qualification,
          industry: candidate.industry,
          domain: candidate.domain,
          exp: candidate.exp,
          cLocation: candidate.cLocation,
          pLocation: candidate.pLocation,
          currentCTC: candidate.currentCTC,
          expectedCTC: candidate.expectedCTC,
          noticePeriod: candidate.noticePeriod,
          wfh: candidate.wfh,
          resumeLink: candidate.resumeLink,
          linkedinLink: candidate.linkedinLink,
          feedback: candidate.feedback,
          remark: candidate.remark,
          company: candidate.company,
          voiceNonVoice: candidate.voiceNonVoice,
          source: candidate.source,
          interested: candidate.interested,
          isProcessAssigned: true,
        };

        process.interestedCandidates.push(newCandidate);

        candidate.assignProcess = null; // Reset the assignProcess in MasterSheet
        candidate.isProcessAssigned = true;

        await client.save();
        await candidate.save();

        return res.status(200).json({
          message:
            "Candidate added to interestedCandidates and updated in MasterSheet",
        });
      } else {
        return res.status(404).json({ message: "Client or process not found" });
      }
    } else {
      // If assignProcess is not changed, update all copies in interestedCandidates[]
      const clients = await ClientSheet.find({
        "clientProcess.interestedCandidates.candidateId": candidate._id,
      });

      for (const client of clients) {
        for (const process of client.clientProcess) {
          const interestedCandidate = process.interestedCandidates.find(
            (c) => c.candidateId.toString() === candidate._id.toString()
          );

          if (interestedCandidate) {
            interestedCandidate.name = candidate.name;
            interestedCandidate.email = candidate.email;
            interestedCandidate.phone = candidate.phone;
            interestedCandidate.status = candidate.status;
            interestedCandidate.language = candidate.language;
            interestedCandidate.jbStatus = candidate.jbStatus;
            interestedCandidate.qualification = candidate.qualification;
            interestedCandidate.industry = candidate.industry;
            interestedCandidate.domain = candidate.domain;
            interestedCandidate.exp = candidate.exp;
            interestedCandidate.cLocation = candidate.cLocation;
            interestedCandidate.pLocation = candidate.pLocation;
            interestedCandidate.currentCTC = candidate.currentCTC;
            interestedCandidate.expectedCTC = candidate.expectedCTC;
            interestedCandidate.noticePeriod = candidate.noticePeriod;
            interestedCandidate.wfh = candidate.wfh;
            interestedCandidate.resumeLink = candidate.resumeLink;
            interestedCandidate.linkedinLink = candidate.linkedinLink;
            interestedCandidate.feedback = candidate.feedback;
            interestedCandidate.remark = candidate.remark;
            interestedCandidate.company = candidate.company;
            interestedCandidate.voiceNonVoice = candidate.voiceNonVoice;
            interestedCandidate.source = candidate.source;
          }
        }
        await client.save();
      }

      await candidate.save();
      return res.status(200).json({
        message: "Candidate updated in MasterSheet and all duplicate copies",
      });
    }
  } catch (err) {
    console.log("in the catch box");
    res.status(500).json({ message: err.message });
  }
});

// Updating (POST) and shifting MULTIPLE candidates to intCandidate[] of the process (just assignedRecruiter option)
router.post("/candidates/assign-process", async (req, res) => {
  try {
    const { ids, newAssignProcess } = req.body;

    // Split the newAssignProcess to get client and process details
    const [clientName, processName, processLanguage] =
      newAssignProcess.split(" - ");

    // Fetch the client and process
    const client = await ClientSheet.findOne({
      clientName,
      "clientProcess.clientProcessName": processName,
      "clientProcess.clientProcessLanguage": processLanguage,
    });

    if (!client) {
      return res.status(404).json({ message: "Client or process not found" });
    }

    // Find candidates by IDs
    const candidates = await Mastersheet.find({ _id: { $in: ids } });

    let duplicateCandidates = [];

    for (let candidate of candidates) {
      // Create a new candidate object
      const newCandidate = {
        candidateId: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        language: candidate.language,
        jbStatus: candidate.jbStatus,
        qualification: candidate.qualification,
        industry: candidate.industry,
        domain: candidate.domain,
        exp: candidate.exp,
        cLocation: candidate.cLocation,
        pLocation: candidate.pLocation,
        currentCTC: candidate.currentCTC,
        expectedCTC: candidate.expectedCTC,
        noticePeriod: candidate.noticePeriod,
        wfh: candidate.wfh,
        resumeLink: candidate.resumeLink,
        linkedinLink: candidate.linkedinLink,
        feedback: candidate.feedback,
        remark: candidate.remark,
        company: candidate.company,
        voiceNonVoice: candidate.voiceNonVoice,
        source: candidate.source,
        interested: candidate.interested,
        status: candidate.status,
        isProcessAssigned: true, // Set isProcessAssigned to true
      };

      console.log(
        "Candidate in the masterSheet after assigning process is: " +
          newCandidate
      );

      // Find the process
      const process = client.clientProcess.find(
        (p) =>
          p.clientProcessName === processName &&
          p.clientProcessLanguage === processLanguage
      );

      // Check if the candidate is already in the interestedCandidates array
      const isDuplicate = process.interestedCandidates.some(
        (c) => c.candidateId.toString() === candidate._id.toString()
      );

      if (!isDuplicate) {
        // Add new candidate to the process
        process.interestedCandidates.push(newCandidate);

        // Update candidate in the MasterSheet
        candidate.assignProcess = null;
        candidate.isProcessAssigned = true; // Set isProcessAssigned to true in MasterSheet

        await candidate.save();
      } else {
        // Add to duplicate candidates list
        duplicateCandidates.push(candidate._id.toString());
      }
    }

    // Save the updated client process
    await client.save();

    if (duplicateCandidates.length > 0) {
      res.status(200).json({
        message:
          "Some candidates were not added because they are already assigned to this process",
        duplicateCandidates,
      });
    } else {
      res
        .status(200)
        .json({ message: "Candidates assigned to process successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Updating (POST) and shifting MULTIPLE candidates to intCandidate[] of the process (just assignedRecruiter option)
// router.post("/candidates/assign-process", async (req, res) => {
//   try {
//     const { ids, newAssignProcess } = req.body;

//     // Split the newAssignProcess to get client and process details
//     const [clientName, processName, processLanguage] = newAssignProcess.split(" - ");

//     // Fetch the client and process
//     const client = await ClientSheet.findOne({
//       clientName,
//       "clientProcess.clientProcessName": processName,
//       "clientProcess.clientProcessLanguage": processLanguage,
//     });

//     if (!client) {
//       return res.status(404).json({ message: "Client or process not found" });
//     }

//     // Find candidates by IDs
//     const candidates = await Mastersheet.find({ _id: { $in: ids } });

//     let duplicateCandidates = [];

//     for (let candidate of candidates) {
//       // Create a new candidate object
//       const newCandidate = {
//         candidateId: candidate._id,
//         name: candidate.name,
//         email: candidate.email,
//         phone: candidate.phone,
//         language: candidate.language,
//         jbStatus: candidate.jbStatus,
//         qualification: candidate.qualification,
//         industry: candidate.industry,
//         domain: candidate.domain,
//         exp: candidate.exp,
//         cLocation: candidate.cLocation,
//         pLocation: candidate.pLocation,
//         currentCTC: candidate.currentCTC,
//         expectedCTC: candidate.expectedCTC,
//         noticePeriod: candidate.noticePeriod,
//         wfh: candidate.wfh,
//         resumeLink: candidate.resumeLink,
//         linkedinLink: candidate.linkedinLink,
//         feedback: candidate.feedback,
//         remark: candidate.remark,
//         company: candidate.company,
//         voiceNonVoice: candidate.voiceNonVoice,
//         source: candidate.source,
//         interested: candidate.interested,
//       };

//       // Find the process
//       const process = client.clientProcess.find(
//         (p) =>
//           p.clientProcessName === processName &&
//           p.clientProcessLanguage === processLanguage
//       );

//       // Check if the candidate is already in the interestedCandidates array
//       const isDuplicate = process.interestedCandidates.some(
//         (c) => c.candidateId.toString() === candidate._id.toString()
//       );

//       if (!isDuplicate) {
//         // Add new candidate to the process
//         process.interestedCandidates.push(newCandidate);

//         // Update candidate in the MasterSheet
//         candidate.assignProcess = null;
//         await candidate.save();
//       } else {
//         // Add to duplicate candidates list
//         duplicateCandidates.push(candidate._id.toString());
//       }
//     }

//     // Save the updated client process
//     await client.save();

//     if (duplicateCandidates.length > 0) {
//       res.status(200).json({
//         message: "Some candidates were not added because they are already assigned to this process",
//         duplicateCandidates
//       });
//     } else {
//       res.status(200).json({ message: "Candidates assigned to process successfully" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// import -> without duplicates
router.post("/candidate/import", async (req, res) => {
  try {
    const candidates = req.body.data;

    // Validate data structure
    if (!Array.isArray(candidates)) {
      return res.status(400).json({ message: "Data should be an array" });
    }

    // Extract emails and phone numbers for duplicate checking
    const emails = [];
    const phoneNumbers = [];

    const newCandidates = candidates.map((candidate) => {
      const languages = [];

      // Check if the language fields are present and split them
      if (candidate[3] && candidate[4] && candidate[5]) {
        const lTypes = candidate[3].split(',').map(item => item.trim());
        const langs = candidate[4].split(',').map(item => item.trim());
        const proficiencyLevels = candidate[5].split(',').map(item => item.trim());

        // Create language objects
        for (let i = 0; i < lTypes.length; i++) {
          languages.push({
            lType: lTypes[i],
            lang: langs[i],
            proficiencyLevel: proficiencyLevels[i]
          });
        }
      }

      // Add to lists for duplicate checking
      emails.push(candidate[1]);
      phoneNumbers.push(candidate[2]);

      return {
        name: candidate[0],
        email: candidate[1],
        phone: candidate[2],
        language: languages,
        status: null,
        assignProcess: null,
        isProcessAssigned: false,
        interested: null,
        assignedRecruiter: null,
        jbStatus: candidate[6],
        qualification: candidate[7],
        industry: candidate[8],
        exp: candidate[9],
        domain: candidate[10],
        cLocation: candidate[11],
        pLocation: candidate[12],
        currentCTC: Number(candidate[13]) || 0,
        expectedCTC: Number(candidate[14]) || 0,
        noticePeriod: candidate[15],
        wfh: candidate[16],
        resumeLink: candidate[17],
        linkedinLink: candidate[18],
        feedback: candidate[19],
        remark: candidate[20],
        company: candidate[21],
        voiceNonVoice: candidate[22],
        source: candidate[23],
      };
    });

    // Find existing candidates by email or phone number
    const existingCandidates = await Mastersheet.find({
      $or: [
        { email: { $in: emails } },
        { phone: { $in: phoneNumbers } }
      ]
    });

    const existingEmails = new Set(existingCandidates.map(c => c.email));
    const existingPhoneNumbers = new Set(existingCandidates.map(c => c.phone));

    // Filter out duplicates
    const filteredCandidates = newCandidates.filter(candidate => 
      !existingEmails.has(candidate.email) && 
      !existingPhoneNumbers.has(candidate.phone)
    );

    // Insert non-duplicate candidates
    const result = await Mastersheet.insertMany(filteredCandidates);

    res.status(201).json({ message: "Data imported successfully", result });
  } catch (err) {
    console.error("Error saving the candidates:", err);
    res
      .status(500)
      .json({ message: "Failed to create candidates", error: err.message });
  }
});


// router.post("/candidate/import", async (req, res) => {
//   try {
//     const candidates = req.body.data;

//     // Validate data structure
//     if (!Array.isArray(candidates)) {
//       return res.status(400).json({ message: "Data should be an array" });
//     }

//     // Process each candidate in the array
//     const newCandidates = candidates.map((candidate) => {
//       const languages = [];

//       // Check if the language fields are present and split them
//       if (candidate[3] && candidate[4] && candidate[5]) {
//         const lTypes = candidate[3].split(',').map(item => item.trim());
//         const langs = candidate[4].split(',').map(item => item.trim());
//         const proficiencyLevels = candidate[5].split(',').map(item => item.trim());

//         // Create language objects
//         for (let i = 0; i < lTypes.length; i++) {
//           languages.push({
//             lType: lTypes[i],
//             lang: langs[i],
//             proficiencyLevel: proficiencyLevels[i]
//           });
//         }
//       }


//       return {
//         name: candidate[0],
//         email: candidate[1],
//         phone: candidate[2],
//         language: languages,
//         status: null,
//         assignProcess: null,
//         isProcessAssigned: false,
//         interested: null,
//         assignedRecruiter: null,
//         jbStatus: candidate[6],
//         qualification: candidate[7],
//         industry: candidate[8],
//         exp: candidate[9],
//         domain: candidate[10],
//         cLocation: candidate[11],
//         pLocation: candidate[12],
//         currentCTC: Number(candidate[13]) || 0,
//         expectedCTC: Number(candidate[14]) || 0,
//         noticePeriod: candidate[15],
//         wfh: candidate[16],
//         resumeLink: candidate[17],
//         linkedinLink: candidate[18],
//         feedback: candidate[19],
//         remark: candidate[20],
//         company: candidate[21],
//         voiceNonVoice: candidate[22],
//         source: candidate[23],
//       };
//     });

//     // Insert many documents at once
//     const result = await Mastersheet.insertMany(newCandidates);
//     res.status(201).json({ message: "Data imported successfully", result });
//   } catch (err) {
//     console.error("Error saving the candidates:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to create candidates", error: err.message });
//   }
// });

export default router;
