import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";
import Pagination from "../../components/Pagination.jsx";

const nav = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/companies", label: "Companies", end: true },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications" },
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentCompanies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ pages: 1 });
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams({ page, limit: "8", active: "true" });
        if (search.trim()) qs.set("search", search.trim());
        const data = unwrap(await api.get(`/api/companies?${qs}`));
        setItems(data.items || []);
        setMeta(data.meta || { pages: 1 });
      } catch {
        setItems([]);
      }
    })();
  }, [page, search]);

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Companies"
        subtitle="Verified recruiter partners onboarding through placements cell."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search company or domain"
            className="max-w-xl rounded-lg border px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Pagination page={page} pages={meta.pages} onChange={setPage} />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">Company</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Industry</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.industry}</td>
                  <td className="px-4 py-3 text-xs text-primary">{c.contactEmail || c.website || "—"}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                    Nothing found — widen your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
