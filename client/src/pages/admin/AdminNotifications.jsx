import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts", end: true },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminNotifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: "", message: "", type: "info", audienceRole: "student" },
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const data = unwrap(await api.get("/api/notifications"));
      setRecent(data || []);
    })();
  }, []);

  async function onSubmit(vals) {
    const tid = toast.loading("Publishing…");
    try {
      await api.post("/api/notifications", vals);
      toast.success("students notified", { id: tid });
      reset();
      const data = unwrap(await api.get("/api/notifications"));
      setRecent(data || []);
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Operational communications"
        subtitle="Feeds both in-app envelopes and SMTP when configured server-side."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 max-w-xl rounded-xl border bg-white p-6 shadow-sm">
          <label className="text-sm font-medium">
            Subject
            <input {...register("title", { required: true })} className="mt-2 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Narrative
            <textarea {...register("message", { required: true })} rows={4} className="mt-2 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <div className="mt-4 flex gap-3 text-sm">
            <select {...register("type")} className="rounded border px-3 py-2">
              {["info", "alert", "reminder", "success"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select {...register("audienceRole")} className="rounded border px-3 py-2">
              <option value="student">students</option>
              <option value="admin">staff</option>
              <option value="placement_officer">officers only</option>
              <option value="all">broadcast</option>
            </select>
          </div>
          <button type="submit" className="mt-6 rounded-md bg-primary px-8 py-2 text-sm font-semibold text-white">
            Broadcast
          </button>
        </form>

        <div className="space-y-3">
          {(recent || []).slice(0, 10).map((n) => (
            <div key={n._id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-slate-500">{n.type}</div>
              <div className="text-lg font-semibold">{n.title}</div>
              <div className="text-sm text-slate-600">{n.message}</div>
              <div className="mt-3 text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
