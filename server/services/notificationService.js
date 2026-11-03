import { prisma } from "../config/database.js";
import { sendMail } from "./mailService.js";

export async function notifyUser(userId, title, message, type = "info", link = "") {
  await prisma.notification.create({
    data: { userId, title, message, type, link }
  });
}

export async function notifyRole(role, title, message, type = "info", link = "") {
  await prisma.notification.create({
    data: { audienceRole: role, title, message, type, link }
  });
}

export async function notifyDriveReminder(drive, studentEmails) {
  const title = `Reminder: ${drive.title} deadline approaching`;
  const message = `Apply before ${new Date(drive.applicationDeadline).toLocaleString()}`;
  for (const email of studentEmails) {
    await sendMail({
      to: email,
      subject: title,
      text: message,
    });
  }
}

export async function broadcastStudents(title, message, sendEmailToo = false) {
  await notifyRole("student", title, message, "reminder");
  if (sendEmailToo) {
    const users = await prisma.user.findMany({
      where: { role: "student" },
      select: { email: true }
    });
    for (const u of users) {
      await sendMail({ to: u.email, subject: title, text: message });
    }
  }
}
