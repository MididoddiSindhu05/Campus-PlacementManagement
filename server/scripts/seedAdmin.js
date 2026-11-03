import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, prisma } from "../config/database.js";

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!process.env.DATABASE_URL || !email || !password) {
    throw new Error("Set DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD");
  }

  try {
    await connectDB();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      console.log("Admin already exists");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email, password: hashedPassword, name: "Portal Admin", role: "admin" },
    });
    console.log("Admin seeded");
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
