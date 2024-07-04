import mongoose, { model } from "mongoose";  
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    username: String,
    password: String, 
    role: String
  });

  const Users = model("Users", userSchema);

  export default Users;