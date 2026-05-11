import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api } from "../../services/api.js";

const nav = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications" },
  { to: "/student/resume", label: "Résumé", end: true },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentResume() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  async function onUpload(e) {
    e.preventDefault();
    if (!file) {
      toast.error("Choose PDF or DOC/X");
      return;
    }
    const fd = new FormData();
    fd.append("resume", file);
    const tid = toast.loading("Uploading…");
    try {
      await api.post("/api/students/resume", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Stored securely via Multer", { id: tid });
      setFile(null);
    } catch (err) {
      toast.error(err.message, { id: tid });
    }
  }

  async function download() {
    try {
      const res = await api.get("/api/students/resume", { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No résumé on file");
    }
  }

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Résumé uploads"
        subtitle="Allowed types: PDF, DOC/X — capped at 5 MB."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <form onSubmit={onUpload} className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Attachment
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="mt-2 w-full text-sm text-slate-600"
            />
          </label>
          <button type="submit" className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-white">
            Submit for verification
          </button>
          <button type="button" onClick={download} className="mt-3 w-full rounded-md border border-slate-200 py-2 text-sm">
            Preview / download saved copy
          </button>
        </form>
      </AppShell>
    </RequireAuth>
  );
}
