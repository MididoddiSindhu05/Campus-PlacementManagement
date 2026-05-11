import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { useSelector } from "react-redux";
import { api, unwrap } from "../../services/api.js";
import Pagination from "../../components/Pagination.jsx";
import { downloadBlob } from "../../utils/download.js";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/students", label: "Students", end: true },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminStudents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.user?.role);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1 });
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  async function load() {
    const qs = new URLSearchParams({ page, limit: "10" });
    if (search.trim()) qs.set("search", search.trim());
    if (department) qs.set("department", department);
    try {
      const data = unwrap(await api.get(`/api/admin/students?${qs}`));
      setRows(data.items || []);
      setMeta(data.meta || { pages: 1 });
    } catch {
      setRows([]);
      setMeta({ pages: 1 });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, department]);

  async function removeStudent(id) {
    if (!window.confirm("Delete student & auth account?")) return;
    try {
      await api.delete(`/api/admin/students/${id}`);
      toast.success("Removed");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function refreshRankings() {
    const tid = toast.loading("Recomputing…");
    try {
      await api.post("/api/admin/rankings/refresh");
      toast.success("Leaderboard updated", { id: tid });
      load();
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  async function exportCsv() {
    try {
      const res = await api.get("/api/admin/students/export/csv", { responseType: "blob" });
      downloadBlob(res.data, "students.csv");
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Student registry"
        subtitle="Search, export, and curate placement-ready cohorts."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search roll / department"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            value={department}
            onChange={(e) => {
              setPage(1);
              setDepartment(e.target.value);
            }}
            placeholder="Department filter"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button type="button" onClick={exportCsv} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold">
            Export CSV
          </button>
          {role === "admin" && (
            <button type="button" onClick={refreshRankings} className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white">
              Refresh rankings
            </button>
          )}
          <Pagination page={page} pages={meta.pages} onChange={setPage} />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Identity</th>
                <th className="px-4 py-3">Academics</th>
                <th className="px-4 py-3">Status</th>
                {role === "admin" && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(rows || []).map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{s.user?.name}</div>
                    <div className="text-xs text-slate-500">{s.user?.email}</div>
                    <div className="text-xs text-primary">{s.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    Dept {s.department}
                    <br />
                    CGPA {s.cgpa} · backlog {s.backlogs}
                    <br />
                    Grad {s.graduationYear}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.placed ? (
                      <>
                        placed · <span className="text-primary">{s.placedCompanyName}</span>
                      </>
                    ) : (
                      <>active pipeline</>
                    )}
                    <div className="text-[11px] text-slate-500">rank {s.rankScore}</div>
                  </td>
                  {role === "admin" && (
                    <td className="px-4 py-3 text-xs">
                      <button type="button" className="text-red-600 hover:underline" onClick={() => removeStudent(s._id)}>
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
