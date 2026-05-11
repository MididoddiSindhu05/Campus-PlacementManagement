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
  { to: "/admin/companies", label: "Companies", end: true },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminCompanies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: "", industry: "", description: "", website: "", contactEmail: "" },
  });
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);

  async function load() {
    try {
      const data = unwrap(await api.get("/api/companies?limit=50"));
      setRows(data.items || []);
    } catch {
      setRows([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values) {
    const tid = toast.loading("Saving company…");
    try {
      unwrap(await api.post("/api/companies", values));
      toast.success("Company captured", { id: tid });
      reset();
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Recruiter partners"
        subtitle="Canonical company master used by multi-drive orchestration."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={() => setOpen(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            New company
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((c) => (
            <article key={c._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="text-sm text-slate-600">{c.industry}</p>
              <p className="mt-3 text-xs text-slate-500 line-clamp-4">{c.description}</p>
              <div className="mt-4 text-xs text-primary">{c.website || c.contactEmail}</div>
            </article>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Register company</h3>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <input {...register("name", { required: true })} placeholder="Name" className="rounded border px-3 py-2" />
                <input {...register("industry")} placeholder="Industry" className="rounded border px-3 py-2" />
                <textarea {...register("description")} placeholder="Description" className="rounded border px-3 py-2" rows={3} />
                <input {...register("website")} placeholder="Website" className="rounded border px-3 py-2" />
                <input {...register("contactEmail")} type="email" placeholder="Contact email" className="rounded border px-3 py-2" />
              </div>
              <button type="submit" className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-white">
                Save
              </button>
            </form>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}
