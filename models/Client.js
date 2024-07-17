import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
  clientName: { type: String, required: true },
  clientVertical: { type: String },
  clientPoc: [
    {
      clientPocName: { type: String },
      clientPocDesg: { type: String },
      clientPocNumber: { type: Number },
      clientPocEmail: { type: String },
      clientPocLinkedin: { type: String },
    },
  ],
  clientProcess: [
    {
      clientProcessName: { type: String },
      clientProcessLanguage: { type: String },
      clientProcessPoc: [
        {
          clientProcessPocName: { type: String },
          clientProcessPocDesg: { type: String },
          clientProcessPocNumber: { type: Number },
          clientProcessPocEmail: { type: String },
          clientProcessPocLinkedin: { type: String },
        },
      ],
      interestedCandidates: [
        {
          candidateId: { type: Schema.Types.ObjectId, ref: "Mastersheet" },
          name: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String, required: true },
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
          interested: { type: String, default: null },
          markedInterestedDate: { type: Date, default: null },
          assignedRecruiter: { type: String, default: null },
          assignedRecruiterId: {type: Schema.Types.ObjectId, default: null},
          assignedRecruiterDate: { type: Date, default: null },
          status: { type: String, default: null },
        },
      ],
      clientProcessCandReq: { type: String },
      clientProcessDeadline: { type: Date },
      clientProcessPckg: { type: String },
      clientProcessLocation: { type: String },
      clientProcessJoining: { type: Date },
      clientProcessPerks: { type: String },
      clientProcessJobDesc: { type: String },
    },
  ],
});

const ClientSheet = mongoose.model("ClientSheet", ClientSchema);

export default ClientSheet;
