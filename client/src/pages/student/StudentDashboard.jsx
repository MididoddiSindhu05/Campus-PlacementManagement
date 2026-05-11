import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { useNavigate } from "react-router-dom";
import { api, unwrap } from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";

const nav = [
  { to: "/student/dashboard", label: "Dashboard", end: true },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications" },
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ apps: 0, eligible: 0, placed: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [apps, elig, prof] = await Promise.all([
          unwrap(await api.get("/api/students/applications/summary")),
          unwrap(await api.get("/api/students/drives/eligible")),
          unwrap(await api.get("/api/students/me")),
        ]);
        if (!alive) return;
        const eligibleCount = Array.isArray(elig) ? elig.filter((d) => d.eligible).length : 0;
        setStats({
          apps: apps?.length || 0,
          eligible: eligibleCount,
          placed: !!prof?.placed,
        });
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Student dashboard"
        subtitle="Track applications, eligibility, and upcoming drives."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Live applications</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.apps}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Eligible open drives</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{stats.eligible}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Placement status</div>
              <div className="mt-2 text-xl font-semibold text-primary">{stats.placed ? "Placed" : "Seeking"}</div>
              <div className="mt-4 text-xs text-slate-500">Use Drives tab to browse recommended listings.</div>
            </div>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}
