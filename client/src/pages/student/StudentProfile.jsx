import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api, unwrap } from "../../services/api.js";

const nav = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications" },
  { to: "/student/resume", label: "Résumé" },
  { to: "/student/profile", label: "Profile", end: true },
  { to: "/student/notifications", label: "Notifications" },
];

export default function StudentProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    (async () => {
      try {
        const me = unwrap(await api.get("/api/students/me"));
        reset({
          phone: me.phone,
          department: me.department,
          cgpa: me.cgpa,
          backlogs: me.backlogs,
          graduationYear: me.graduationYear,
          skillsInput: (me.skills || []).join(", "),
        });
      } catch {
        toast.error("Could not hydrate profile");
      }
    })();
  }, [reset]);

  async function onSubmit(vals) {
    const skills = vals.skillsInput
      ? vals.skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const tid = toast.loading("Saving…");
    try {
      unwrap(
        await api.patch("/api/students/me", {
          phone: vals.phone,
          department: vals.department,
          cgpa: Number(vals.cgpa),
          backlogs: Number(vals.backlogs),
          graduationYear: Number(vals.graduationYear),
          skills,
        })
      );
      toast.success("Profile synced", { id: tid });
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["student"]}>
      <AppShell
        title="Profile & academics"
        subtitle="Changes refresh eligibility computations immediately."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl rounded-xl border border-white bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Phone
              <input {...register("phone")} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium">
              Department
              <input {...register("department")} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium">
              CGPA
              <input type="number" step="0.01" {...register("cgpa", { valueAsNumber: true })} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium">
              Backlogs
              <input type="number" {...register("backlogs", { valueAsNumber: true })} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Graduation year
              <input type="number" {...register("graduationYear", { valueAsNumber: true })} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium md:col-span-2">
              Skills CSV
              <input {...register("skillsInput")} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
            </label>
          </div>
          <button type="submit" className="mt-8 rounded-md bg-primary px-8 py-2 text-sm font-semibold text-white">
            Save canonical record
          </button>
        </form>
      </AppShell>
    </RequireAuth>
  );
}
