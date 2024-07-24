import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  // totalAssignedCandidates: { type: Number, default: 0},
  // totalInterestedAmongstAssigned: {type: Number, default: 0},
  // totalSelectedAmongstInterested: {type: Number, default: 0}
});

const Users = model("Users", userSchema);

export default Users;
