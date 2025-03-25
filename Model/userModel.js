import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  user_role: {
    type: String,
    required: true,
    enum: ["user", "admin", "helpDesk"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  mobile_no: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
 
});

const userModel = mongoose.model("USER", userSchema);
export default userModel;
