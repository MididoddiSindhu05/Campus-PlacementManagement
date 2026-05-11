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
  { to: "/admin/drives", label: "Drives", end: true },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminDrives() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      company: "",
      title: "",
      jobRole: "",
      description: "",
      salaryMin: 8,
      salaryMax: 16,
      minCgpa: 6.5,
      maxBacklogs: 0,
      openings: 5,
      applicationDeadline: "",
      driveDate: "",
      requiredSkills: "JavaScript,Communication",
      eligibleDepartments: "CSE,IT,ECE",
      graduationYears: "2025,2026",
      roundsJson: '[{"name":"OA","order":1},{"name":"Technical","order":2}]',
    },
  });
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = unwrap(await api.get("/api/companies?limit=100"));
        setCompanies(c.items || []);
        const d = unwrap(await api.get("/api/drives?limit=50"));
        setDrives(d.items || []);
      } catch {
        setCompanies([]);
        setDrives([]);
      }
    })();
  }, []);

  async function onSubmit(vals) {
    const tid = toast.loading("Publishing drive…");
    try {
      const rounds = JSON.parse(vals.roundsJson || "[]");
      const requiredSkills = vals.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const eligibleDepartments = vals.eligibleDepartments.split(",").map((s) => s.trim()).filter(Boolean);
      const graduationYears = vals.graduationYears.split(",").map((n) => Number(n.trim())).filter(Boolean);
      unwrap(
        await api.post("/api/drives", {
          company: vals.company,
          title: vals.title,
          jobRole: vals.jobRole,
          description: vals.description,
          salaryMin: Number(vals.salaryMin),
          salaryMax: Number(vals.salaryMax),
          minCgpa: Number(vals.minCgpa),
          maxBacklogs: Number(vals.maxBacklogs),
          openings: Number(vals.openings),
          applicationDeadline: vals.applicationDeadline,
          driveDate: vals.driveDate || undefined,
          requiredSkills,
          eligibleDepartments,
          graduationYears,
          rounds,
          status: "open",
        })
      );
      toast.success("Drive live", { id: tid });
      reset();
      setOpen(false);
      try {
        const d = unwrap(await api.get("/api/drives?limit=50"));
        setDrives(d.items || []);
      } catch {
        setDrives([]);
      }
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Placement drives"
        subtitle="Eligibility DSL executed server-side — students never bypass gates."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={() => setOpen(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Schedule drive
          </button>
        </div>
        <div className="space-y-3">
          {drives.map((d) => (
            <div key={d._id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase text-slate-400">{d.company?.name}</div>
                  <div className="text-lg font-semibold text-slate-900">{d.title}</div>
                  <div className="text-primary">{d.jobRole}</div>
                </div>
                <div className="text-xs text-slate-500">
                  deadline {new Date(d.applicationDeadline).toLocaleString()}
                  <br />
                  status {d.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto my-8 max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Drive composer</h3>
                <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                <label className="md:col-span-2">
                  Company
                  <select {...register("company", { required: true })} className="mt-2 w-full rounded border px-3 py-2">
                    <option value="">Pick…</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Title
                  <input {...register("title", { required: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Role
                  <input {...register("jobRole", { required: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label className="md:col-span-2">
                  Description
                  <textarea {...register("description")} rows={3} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  CGPA cutoff
                  <input type="number" step="0.1" {...register("minCgpa", { valueAsNumber: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Max backlogs
                  <input type="number" {...register("maxBacklogs", { valueAsNumber: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Salary min (LPA)
                  <input type="number" {...register("salaryMin", { valueAsNumber: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Salary max (LPA)
                  <input type="number" {...register("salaryMax", { valueAsNumber: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Openings
                  <input type="number" {...register("openings", { valueAsNumber: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Application deadline
                  <input type="datetime-local" {...register("applicationDeadline", { required: true })} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Drive date (optional)
                  <input type="datetime-local" {...register("driveDate")} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Departments CSV
                  <input {...register("eligibleDepartments")} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Grad years CSV
                  <input {...register("graduationYears")} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label>
                  Skills CSV
                  <input {...register("requiredSkills")} className="mt-2 w-full rounded border px-3 py-2" />
                </label>
                <label className="md:col-span-2">
                  Rounds JSON
                  <textarea {...register("roundsJson")} rows={4} className="mt-2 w-full rounded border px-3 py-2 font-mono text-xs" />
                </label>
              </div>
              <button type="submit" className="mt-6 w-full rounded-md bg-primary py-2 font-semibold text-white">
                Publish listing
              </button>
            </form>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}
