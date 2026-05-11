import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";

const nav = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const dash = unwrap(await api.get("/api/analytics/dashboard"));
        setData(dash);
      } catch {
        setData(null);
      }
    })();
  }, []);

  const t = data?.totals || {};

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Command center"
        subtitle="Instant visibility into placements funnel health across departments."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        {!data ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Registered students" value={t.students || 0} />
            <Stat label="Offers accepted" value={t.placedStudents || 0} hint={`${t.placementPercentage || 0}% placement rate`} />
            <Stat label="Active companies" value={t.companies || 0} />
            <Stat label="Archived drives" value={t.drives || 0} />
            <Stat label="Submitted applications" value={t.applications || 0} />
            <div className="rounded-xl border border-slate-100 bg-teal-50 p-6 text-sm shadow-sm">
              <div className="font-semibold text-primary">Operational shortcuts</div>
              <ul className="mt-3 space-y-2 text-teal-900">
                <li>
                  • <Link to="/admin/notifications">Broadcast reminders</Link> for upcoming deadlines
                </li>
                <li>
                  • <Link to="/admin/analytics">Open analytics cockpit</Link> for department deltas
                </li>
              </ul>
            </div>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-3 text-xs text-primary">{hint}</div>}
    </div>
  );
}
