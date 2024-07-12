import mongoose from 'mongoose';
const { Schema } = mongoose;

const MasterSheetSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: null },
  assignProcess: { type: String, default: null },
  interested: { type: String, default: null },  // Field for marking candidates interested or not by the recruiters
  assignedRecruiter: { type: String, default: null },
  lType: { type: String, required: true },
  language: { type: Array, required: true },
  proficiencyLevel: { type: String },
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

const Mastersheet = mongoose.model('Mastersheet', MasterSheetSchema);

export default Mastersheet;

