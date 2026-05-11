import mongoose from "mongoose";
import { User } from "./models/User.js";
import { connectDB } from "./config/database.js";
import "dotenv/config";

async function run() {
  await connectDB();
  await User.deleteOne({ email: "admin@college.edu" });
  console.log("Deleted admin user");
  process.exit(0);
}
run();
