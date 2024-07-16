import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const Users = model("Users", userSchema);

export default Users;
