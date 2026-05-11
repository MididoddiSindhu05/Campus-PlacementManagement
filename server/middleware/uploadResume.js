import fs from "fs";
import multer from "multer";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename(_req, file, cb) {
    const safe = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safe);
  },
});

function fileFilter(_req, file, cb) {
  const ok =
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ok) cb(null, true);
  else cb(new Error("Only PDF and DOC/DOCX files allowed"));
}

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
