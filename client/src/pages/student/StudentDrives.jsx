import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";

const nav = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/drives", label: "Drives", end: true },
  { to: "/student/applications", label: "Applications" },
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentDrives() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [recs, setRecs] = useState([]);

  async function load() {
    const [e, r] = await Promise.all([
      api.get("/api/students/drives/eligible"),
      api.get("/api/students/drives/recommended"),
    ]);
    setDrives(unwrap(e));
    setRecs(unwrap(r));
  }

  useEffect(() => {
    load();
  }, []);

  async function apply(driveId) {
    const p = toast.loading("Submitting application…");
    try {
      await api.post(`/api/applications/drive/${driveId}/apply`);
      toast.success("Application recorded", { id: p });
      load();
    } catch (err) {
      toast.error(err.message, { id: p });
    }
  }

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Placement drives"
        subtitle="Eligible drives only — criteria enforced via backend rules."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Recommended for you</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(recs || []).slice(0, 6).map((d) => (
              <DriveCard key={d._id} d={d} onApply={() => apply(d._id)} showScore />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Eligibility-aware catalogue</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {drives.map((d) => (
              <DriveCard key={d._id} d={d} onApply={() => apply(d._id)} />
            ))}
            {!drives.length && <p className="text-sm text-slate-500">No open drives configured yet.</p>}
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}

function DriveCard({ d, onApply, showScore }) {
  const reasons = Array.isArray(d.eligibilityReasons) ? d.eligibilityReasons : [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">{d.company?.name}</div>
          <h3 className="text-lg font-semibold text-slate-900">{d.title}</h3>
          <p className="text-sm text-primary">{d.jobRole}</p>
        </div>
        {showScore && (
          <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-primary">
            Score {d.recommendationScore}
          </div>
        )}
      </div>
      <p className="mt-4 line-clamp-3 text-xs text-slate-600">{d.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <dt>CGPA min</dt>
          <dd className="font-semibold text-slate-900">{d.minCgpa}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd className="font-semibold text-slate-900">{new Date(d.applicationDeadline).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt>Package</dt>
          <dd className="font-semibold text-slate-900">
            {d.salaryMin} – {d.salaryMax} {d.currency}
          </dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd className="font-semibold text-slate-900">{(d.requiredSkills || []).join(", ") || "—"}</dd>
        </div>
      </dl>
      {!d.eligible ? (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          Locked: {reasons.join("; ") || "Not eligible"}
        </div>
      ) : (
        <button type="button" onClick={onApply} className="mt-4 w-full rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark">
          Apply now
        </button>
      )}
    </div>
  );
}
