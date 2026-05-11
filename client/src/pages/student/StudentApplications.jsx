import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api } from "../../services/api.js";
import { downloadBlob } from "../../utils/download.js";

const nav = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications", end: true },
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  async function refresh() {
    const res = await api.get("/api/students/applications/summary");
    setRows(res.data.data || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function withdraw(id) {
    const tid = toast.loading("Withdrawing…");
    try {
      await api.patch(`/api/applications/withdraw/${id}`);
      toast.success("Withdrawn", { id: tid });
      refresh();
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  async function admit(ivId) {
    try {
      const res = await api.get(`/api/interviews/${ivId}/admit-card`, { responseType: "blob" });
      downloadBlob(res.data, `admit-${ivId}.txt`);
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Applications & interviews"
        subtitle="Observe status transitions and download interview artefacts issued by coordinators."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="space-y-4">
          {(rows || []).map((app) => (
            <article key={app._id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs text-slate-500">{app.placementDrive?.company?.name}</div>
                  <h3 className="text-lg font-semibold text-slate-900">{app.placementDrive?.title}</h3>
                  <p className="text-sm text-slate-600">{app.placementDrive?.jobRole}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{app.status}</span>
                  {(app.interviews || []).map((iv) => (
                    <button
                      key={iv._id}
                      type="button"
                      className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-primary"
                      onClick={() => admit(iv._id)}
                    >
                      Admit · {iv.roundName}
                    </button>
                  ))}
                </div>
              </header>
              <footer className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                Applied {new Date(app.appliedAt).toLocaleString()}
                {(app.interviews || []).map((iv) => (
                  <span key={`${iv._id}-meta`}>
                    Interview {iv.roundName}: {new Date(iv.scheduledAt).toLocaleString()} — {iv.venue || iv.meetingLink || "Online"}
                  </span>
                ))}
                {"pending" === app.status && (
                  <button type="button" className="ml-auto font-semibold text-red-600" onClick={() => withdraw(app._id)}>
                    Withdraw
                  </button>
                )}
              </footer>
              {!!app.fraudFlag && (
                <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900">
                  Flagged application — placements cell outreach may follow.
                </div>
              )}
            </article>
          ))}
          {!rows.length && <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No applications yet.</div>}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
