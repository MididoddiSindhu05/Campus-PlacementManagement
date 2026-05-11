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
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports", end: true },
];

export default function AdminReports() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/reports");
        setRows(res.data.data || []);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  async function downloadPdf() {
    const tid = toast.loading("Rendering PDF…");
    try {
      const res = await api.get("/api/reports/placement/pdf", { responseType: "blob" });
      downloadBlob(res.data, "placement-summary.pdf");
      toast.success("Download started", { id: tid });
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Regulatory exports"
        subtitle="Server-side PDFKit pipeline — immutable artefact log below."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <button type="button" onClick={downloadPdf} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white">
          Generate placement summary PDF
        </button>

        <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Artifact</th>
                <th className="px-4 py-3">Issuer</th>
                <th className="px-4 py-3">Emitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-semibold">{r.title}</td>
                  <td className="px-4 py-3">{r.generatedBy?.name || r.generatedBy?.email}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    No artefacts yet — run generator.
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
