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

// DELETE candidate by id
router.delete("/candidates/:id", async (req, res) => {
  try {
    const candidate = await Mastersheet.findById(req.params.id);
    console.log("Candidate lead:", candidate);

    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }

    await candidate.deleteOne();
    res.json({ message: "candidate deleted successfully" });
    console.log("Delete candidate");
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
    console.log("New assignProcess is: " + newAssignProcess);
    console.log("req.body.assignProcess is: " + req.body.assignProcess);
    console.log("candidate.assignProcess is: " + candidate.assignProcess);

    // Updating candidate with new entries
    candidate.name = req.body.name || candidate.name;
    candidate.email = req.body.email || candidate.email;
    candidate.phone = req.body.phone || candidate.phone;
    candidate.status = req.body.status || candidate.status;
    candidate.assignProcess = newAssignProcess;
    candidate.interested = req.body.interested || candidate.interested;
    candidate.assignedRecruiter =
      req.body.assignedRecruiter || candidate.assignedRecruiter;
    candidate.lType = req.body.lType || candidate.lType;
    candidate.language = req.body.language || candidate.language;
    candidate.proficiencyLevel =
      req.body.proficiencyLevel || candidate.proficiencyLevel;
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

    // if assignProcess is changed
    if (newAssignProcess == candidate.assignProcess) {
      console.log("in if statement");
      const [clientName, processName, processLanguage] = newAssignProcess.split(" - ");

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
          lType: candidate.lType,
          language: candidate.language,
          proficiencyLevel: candidate.proficiencyLevel,
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
        };

        process.interestedCandidates.push(newCandidate);

        candidate.assignProcess = null; // Reset the assignProcess in MasterSheet

        await client.save();
        await candidate.save();

        return res.status(200).json({
          message:
            "Candidate added to interestedCandidates and updated in MasterSheet",
        });
      } else {
        return res.status(404).json({ message: "Client or process not found" });
      }
    }
    else {
      console.log("Client saved");
      await candidate.save();
      return res.status(200).json(candidate);
    }
  } catch (err) {
    console.log("in the catch box");
    res.status(500).json({ message: err.message });
  }
});

// Updating (POST) and shifting MULTIPLE candidates to intCandidate[] of the process (just assignedRecruiter option)
router.post("/candidates/update", async (req, res) => {
  try {
    const { ids, newAssignProcess } = req.body;

    // Split the newAssignProcess to get client and process details
    const [clientName, processName, processLanguage] = newAssignProcess.split(" - ");

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
        lType: candidate.lType,
        language: candidate.language,
        proficiencyLevel: candidate.proficiencyLevel,
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
      };

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
        message: "Some candidates were not added because they are already assigned to this process",
        duplicateCandidates
      });
    } else {
      res.status(200).json({ message: "Candidates assigned to process successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
