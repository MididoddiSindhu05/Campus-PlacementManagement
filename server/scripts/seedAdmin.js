import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User.js";

dotenv.config();

async function seed() {
  const uri = process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!uri || !email || !password) {
    console.error("Set MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit(0);
  }
  await User.create({ email, password, name: "Portal Admin", role: "admin" });
  console.log("Admin seeded");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
