import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const SelectedSheetSchema = new Schema({
  // Defining fixed fields
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: "not assigned" },
  language: { type: Array, required: true },
  jbStatus: { type: String },
  qualification: { type: String },
  industry: { type: String },
  domain: { type: String },
  exp: { type: String },
  cLocation: { type: String },
  pLocation: { type: String },
  currentCTC: { type: Number },
  expectedCTC: { type: Number },
  noticePeriod: { type: String },
  wfh: { type: String },
  resumeLink: { type: String },
  linkedinLink: { type: String },
  feedback: { type: String },
  remark: { type: String },
  company: { type: String },
  voiceNonVoice: { type: String },
  source: { type: String },
  placedBy: { type: String },
});

export default model("SeletedSheet", SelectedSheetSchema);
