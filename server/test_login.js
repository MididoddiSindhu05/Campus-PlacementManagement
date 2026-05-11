import mongoose from "mongoose";
import { User } from "./models/User.js";
import { connectDB } from "./config/database.js";
import "dotenv/config";

async function test() {
  await connectDB();
  const user = await User.findOne({ email: "admin@college.edu" }).select("+password");
  if (!user) {
    console.log("USER DOES NOT EXIST");
  } else {
    console.log("User found:", user.email, "Role:", user.role);
    const pass1 = "admin@1234#";
    const pass2 = "ChangeMe_Strong#";
    console.log("Matches admin@1234#:", await user.comparePassword(pass1));
    console.log("Matches ChangeMe_Strong#:", await user.comparePassword(pass2));
  }
  process.exit(0);
}
test();
