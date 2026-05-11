import { useEffect, useState } from "react";
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
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/notifications", label: "Notifications", end: true },
];

export default function StudentNotifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  async function refresh() {
    try {
      const res = await api.get("/api/notifications");
      setItems(res.data.data || []);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function markRead(id) {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      toast.success("Acknowledged");
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Notifications"
        subtitle="Broadcasts routed through `/notifications` middleware."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="space-y-3">
          {(items || []).map((n) => (
            <div key={n._id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <div className="text-xs uppercase text-primary">{n.type}</div>
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <p className="text-sm text-slate-600">{n.message}</p>
                <div className="mt-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && (
                <button type="button" onClick={() => markRead(n._id)} className="rounded-md border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-teal-50">
                  Acknowledge
                </button>
              )}
            </div>
          ))}
          {!items.length && <p className="text-center text-sm text-slate-500">Inbox pristine.</p>}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
