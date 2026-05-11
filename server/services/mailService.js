import nodemailer from "nodemailer";
import { logInfo, logError } from "../utils/logger.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS || "" },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    logInfo("Email skipped (SMTP not configured)", { to, subject });
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || subject,
      html: html || text,
    });
    return { sent: true };
  } catch (e) {
    logError("sendMail failed", e);
    return { sent: false, error: e.message };
  }
}
