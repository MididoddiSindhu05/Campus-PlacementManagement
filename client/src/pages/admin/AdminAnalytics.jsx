import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics", end: true },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

const COLORS = ["#0f766e", "#0ea5e9", "#9333ea", "#f97316", "#eab308"];

export default function AdminAnalytics() {
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

  const deptData = useMemo(
    () =>
      (data?.departmentWise || []).map((row) => ({
        department: row._id || "??",
        placed: row.placed,
        total: row.total,
      })),
    [data]
  );

  const statusData = useMemo(
    () =>
      (data?.applicationStatusMix || []).map((row) => ({
        name: row._id,
        value: row.count,
      })),
    [data]
  );

  const trendData = useMemo(
    () =>
      (data?.placementTrends || []).map((row) => ({
        label: `${row._id.y}-${row._id.m}`,
        volume: row.count,
      })),
    [data]
  );

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Analytics cockpit"
        subtitle="Aggregations executed in MongoDB — safe for leadership reviews."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        {!data ? (
          <Spinner />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Kpi title="Highest CTC (mapped)" value={`${data.packages?.maxPackage?.toFixed?.(2) ?? 0} LPA`} />
              <Kpi title="Average ceiling" value={`${(data.packages?.avgPackage ?? 0).toFixed?.(2) ?? "0"} LPA`} />
              <Kpi title="Applicants volume" value={data.totals?.applications ?? 0} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="h-72 rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-900">Dept placements</div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={deptData}>
                    <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="placed" fill="#0f766e" name="placed" />
                    <Bar dataKey="total" fill="#cbd5f5" opacity={0.65} name="cohort size" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-72 rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm font-semibold text-slate-900">Application mix</div>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="h-80 rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-4 text-sm font-semibold text-slate-900">Application velocity</div>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={trendData}>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="volume" stroke="#0f766e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs uppercase text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-primary">{value}</div>
    </div>
  );
}
