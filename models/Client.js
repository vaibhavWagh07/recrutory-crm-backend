import mongoose from "mongoose";
import Users from "../models/Users.js";

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
          interested: { type: String, default: null },
          markedInterestedDate: { type: Date, default: null },
          assignedRecruiter: { type: String, default: null },
          assignedRecruiterId: {type: Schema.Types.ObjectId, default: null},
          assignedRecruiterDate: { type: Date, default: null },
          status: { type: String, default: null },
          isProcessAssigned: { type: Boolean, default: false },
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

// function for updation of the totalAssigned etc etc count in the user (not working so halted it)
// ClientSchema.pre('save', async function (next) {
//   const client = this;

//   console.log("client is: " + client);

//   for (const process of client.clientProcess) {
//     for (const candidate of process.interestedCandidates) {
//       const recruiterId = candidate.assignedRecruiterId;
//       console.log("recruiter id is: " + recruiterId);

//       if (recruiterId) {

//         // Calculate total assigned candidates
//         const totalAssignedCandidates = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           // console.log("1st unwind property: " + unwind),
//           { $unwind: '$clientProcess.interestedCandidates' },
//           // console.log("2nd unwind property: " + unwind),
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiterId } },
//           // console.log("match property: " + match),
//           { $group: { _id: null, totalAssigned: { $sum: 1 } } },
//           // console.log("Sum at each stage is: " + sum),
//           // console.log("group property: " + group),
//         ]);
//         const totalAssignedCount = totalAssignedCandidates.length > 0 ? totalAssignedCandidates[0].totalAssigned : 0;
//         console.log("------------------- total assigned --------------------");
//         console.log("totalassignedCandiates length is: " + totalAssignedCandidates.length);
//         console.log("totalAssignedCandidates[0].totalAssigned is: " + totalAssignedCandidates[0].totalAssigned);
//         console.log("---------------------------------------------------------");


//         // Calculate total interested amongst assigned
//         const totalInterestedAmongstAssigned = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           { $unwind: '$clientProcess.interestedCandidates' },
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiterId, 'clientProcess.interestedCandidates.interested': 'interested' } },
//           { $group: { _id: null, totalInterested: { $sum: 1 } } },
//           // console.log("sum in the totalInterestedAmongstAssigned is: " + sum),
//         ]);
//         const totalInterestedCount = totalInterestedAmongstAssigned.length > 0 ? totalInterestedAmongstAssigned[0].totalInterested : 0;
//         console.log("------------------- totalInterestedCount --------------------");
//         console.log("totalInterestedAmongstAssigned length is: " + totalInterestedAmongstAssigned[0].length);
//         console.log("totalInterestedCount is: " + totalInterestedCount);
//         console.log("---------------------------------------------------------");

//         // Calculate total selected amongst interested
//         const totalSelectedAmongstInterested = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           { $unwind: '$clientProcess.interestedCandidates' },
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiterId, 'clientProcess.interestedCandidates.status': 'selected' || null } },
//           { $group: { _id: null, totalSelected: { $sum: 1 } } },     
//           // console.log("sum in the totalSelectedAmongstInterested is: " + sum),
//         ]);
//         const totalSelectedCount = totalSelectedAmongstInterested.length > 0 ? totalSelectedAmongstInterested[0].totalSelected : 0;
//         console.log("------------------- totalSelectedCount --------------------");
//         console.log("totalSelectedAmongstInterested length is: " + totalSelectedAmongstInterested[0].length);
//         // console.log("totalSelectedAmongstInterested[0].totalSelected is: " + totalSelectedAmongstInterested[0].totalSelected);
//         console.log("totalSelectedCount is: " + totalSelectedCount);
//         console.log("---------------------------------------------------------");

//         // Update the recruiter counts
//         await Users.findByIdAndUpdate(recruiterId, {
//           totalAssignedCandidates: totalAssignedCount,
//           totalInterestedAmongstAssigned: totalInterestedCount,
//           totalSelectedAmongstInterested: totalSelectedCount
//         });
//       }
//     }
//   }

//   next();
// });

// ClientSchema.pre('save', async function (next) {
//   const client = this;
//   for (const process of client.clientProcess) {
//     for (const candidate of process.interestedCandidates) {
//       const recruiter = await Users.findById(candidate.assignedRecruiterId);

//       if (recruiter) {
//         // Calculate total assigned candidates
//         const totalAssignedCandidates = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           { $unwind: '$clientProcess.interestedCandidates' },
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiter._id } },
//           { $count: 'totalAssigned' }
//         ]);
//         recruiter.totalAssignedCandidates = totalAssignedCandidates.length > 0 ? totalAssignedCandidates[0].totalAssigned : 0;

//         // Calculate total interested amongst assigned
//         const totalInterestedAmongstAssigned = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           { $unwind: '$clientProcess.interestedCandidates' },
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiter._id, 'clientProcess.interestedCandidates.interested': 'yes' } },
//           { $count: 'totalInterested' }
//         ]);
//         recruiter.totalInterestedAmongstAssigned = totalInterestedAmongstAssigned.length > 0 ? totalInterestedAmongstAssigned[0].totalInterested : 0;

//         // Calculate total selected amongst interested
//         const totalSelectedAmongstInterested = await ClientSheet.aggregate([
//           { $unwind: '$clientProcess' },
//           { $unwind: '$clientProcess.interestedCandidates' },
//           { $match: { 'clientProcess.interestedCandidates.assignedRecruiterId': recruiter._id, 'clientProcess.interestedCandidates.status': 'selected' } },
//           { $count: 'totalSelected' }
//         ]);
//         recruiter.totalSelectedAmongstInterested = totalSelectedAmongstInterested.length > 0 ? totalSelectedAmongstInterested[0].totalSelected : 0;

//         await recruiter.save();
//       }
//     }
//   }

//   next();
// });

const ClientSheet = mongoose.model("ClientSheet", ClientSchema);

export default ClientSheet;

