import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { sendMail } from "./mailService.js";

export async function notifyUser(userId, title, message, type = "info", link = "") {
  await Notification.create({ user: userId, title, message, type, link });
}

export async function notifyRole(role, title, message, type = "info", link = "") {
  await Notification.create({ audienceRole: role, title, message, type, link });
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
    const users = await User.find({ role: "student" }).select("email");
    for (const u of users) {
      await sendMail({ to: u.email, subject: title, text: message });
    }
  }
}
