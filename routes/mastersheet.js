import express from "express";
import "dotenv/config.js";
import Masterlead from "../models/Mastersheet.js";
import Selectedsheet from "../models/Selectedsheet.js";

const router = express.Router();

// checking api
router.get("/", (req, res) => {
  res.status(200).send({
    msg: "lead APIs are working successfully",
  });
});
  
// Create a new lead
router.post("/create", async (req, res) => {
  const lead = new Masterlead({
    fName: req.body.fName,
    lName: req.body.lName,
    email: req.body.email,
    phone: req.body.phone,
    status: req.body.status || "not assigned",
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
    placedBy: req.body.placedBy,
  });

  try {
    const newLead = await lead.save();
    console.log("NewLead is: " + newLead);
    res.status(201).json(newLead);
  } catch (err) {
    console.error("Error saving lead:", err);
    res
      .status(500)
      .json({ message: "Failed to create lead", error: err.message });
  }
});

// GET all leads
router.get("/leads", async (req, res) => {
  try {
    const leads = await Masterlead.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET lead by id
router.get("/leads/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await Masterlead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE lead by id
router.delete("/leads/:id", async (req, res) => {
  try {
    const lead = await Masterlead.findById(req.params.id);
    console.log("Found lead:", lead); // Add this line for debugging

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await lead.deleteOne();
    res.json({ message: "Lead deleted successfully" });
    console.log("Delete lead");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT particular lead
router.put("/leads/:id", async (req, res) => {
  try {
    const lead = await Masterlead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const oldStatus = lead.status;

    // updating lead with new entries
    lead.fName = req.body.fName || lead.fName;
    lead.lName = req.body.lName || lead.lName;
    lead.email = req.body.email || lead.email;
    lead.phone = req.body.phone || lead.phone;
    lead.status = req.body.status || lead.status;
    lead.lType = req.body.lType || lead.lType;
    lead.language = req.body.language || lead.language;
    lead.proficiencyLevel = req.body.proficiencyLevel || lead.proficiencyLevel;
    lead.jbStatus = req.body.jbStatus || lead.jbStatus;
    lead.qualification = req.body.qualification || lead.qualification;
    lead.industry = req.body.industry || lead.industry;
    lead.domain = req.body.domain || lead.domain;
    lead.exp = req.body.exp || lead.exp;
    lead.cLocation = req.body.cLocation || lead.cLocation;
    lead.pLocation = req.body.pLocation || lead.pLocation;
    lead.currentCTC = req.body.currentCTC || lead.currentCTC;
    lead.expectedCTC = req.body.expectedCTC || lead.expectedCTC;
    lead.noticePeriod = req.body.noticePeriod || lead.noticePeriod;
    lead.wfh = req.body.wfh || lead.wfh;
    lead.resumeLink = req.body.resumeLink || lead.resumeLink;
    lead.linkedinLink = req.body.linkedinLink || lead.linkedinLink;
    lead.feedback = req.body.feedback || lead.feedback;
    lead.remark = req.body.remark || lead.remark;
    lead.company = req.body.company || lead.company;
    lead.voiceNonVoice = req.body.voiceNonVoice || lead.voiceNonVoice;
    lead.source = req.body.source || lead.source;
    lead.placedBy = req.body.placedBy || lead.placedBy;

    // if status = done, delete from lead data and add into masterlead data
    if ((lead.status === "selected" || lead.status === "Selected" || lead.status === "SELECTED") && oldStatus !== lead.status) {
      const masterLead = new Selectedsheet({
        fName: lead.fName,
        lName: lead.lName,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        lType: lead.lType,
        language: lead.language,
        proficiencyLevel: lead.proficiencyLevel,
        jbStatus: lead.jbStatus,
        qualification: lead.qualification,
        industry: lead.industry,
        domain: lead.domain,
        exp: lead.exp,
        cLocation: lead.cLocation,
        pLocation: lead.pLocation,
        currentCTC: lead.currentCTC,
        expectedCTC: lead.expectedCTC,
        noticePeriod: lead.noticePeriod,
        wfh: lead.wfh,
        resumeLink: lead.resumeLink,
        linkedinLink: lead.linkedinLink,
        feedback: lead.feedback,
        remark: lead.remark,
        company: lead.company,
        voiceNonVoice: lead.voiceNonVoice,
        source: lead.source,
        placedBy: lead.placedBy,
      });

      try {
        const savedMasterLead = await masterLead.save();
        await Masterlead.findByIdAndDelete(lead._id); // Delete the lead from the Lead collection
        return res.json({
          message: "Lead moved to master collection and deleted from lead collection",
          masterLead: savedMasterLead,
        });
      } catch (err) {
        console.log("error in transferring data into the masterlead");
        return res.status(500).json({
          message: "Error saving to master collection or deleting lead",
          error: err.message,
        });
      }
    } 
    
    // if changes does not include change in status, keep it in lead data once updated
    else {
      const updatedLead = await lead.save();
      res.json(updatedLead);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


export default router;
// not changed the table name lead and masterLead
// lead -> masterlead
// masterLead -> selectedsheet