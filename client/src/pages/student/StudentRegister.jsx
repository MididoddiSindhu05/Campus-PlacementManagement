import { Navigate, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerThunk, bootstrapAuth } from "../../store/slices/authSlice.js";

export default function StudentRegister() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rollNumber: "",
      department: "CSE",
      cgpa: 8,
      backlogs: 0,
      graduationYear: new Date().getFullYear(),
      skillsInput: "",
    },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  if (user?.role === "student") return <Navigate to="/student/dashboard" replace />;

  async function onSubmit(v) {
    const skills = v.skillsInput
      ? String(v.skillsInput)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const p = toast.loading("Creating profile…");
    try {
      await dispatch(
        registerThunk({
          name: v.name,
          email: v.email,
          password: v.password,
          rollNumber: v.rollNumber,
          department: v.department,
          cgpa: Number(v.cgpa),
          backlogs: Number(v.backlogs),
          graduationYear: Number(v.graduationYear),
          skills,
        })
      ).unwrap();
      await dispatch(bootstrapAuth()).unwrap();
      toast.success("Registered — complete your résumé", { id: p });
      navigate("/student/dashboard");
    } catch (e) {
      toast.error(e || "Could not register", { id: p });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Student registration</h1>
          <Link to="/student/login" className="text-sm text-primary hover:underline">
            Have an account?
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Full name
            <input {...register("name", { required: true })} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              {...register("email", { required: true })}
              type="email"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Password (min 8 chars)
            <input
              {...register("password", { required: true, minLength: 8 })}
              type="password"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Roll number
            <input {...register("rollNumber", { required: true })} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            Department
            <input {...register("department")} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">
            CGPA
            <input
              {...register("cgpa", { valueAsNumber: true })}
              step="0.01"
              type="number"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Backlogs
            <input
              {...register("backlogs", { valueAsNumber: true })}
              type="number"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            Graduation year
            <input
              {...register("graduationYear", { valueAsNumber: true })}
              type="number"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Skills (comma separated)
            <input {...register("skillsInput")} className="mt-2 w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>

        <button type="submit" className="mt-10 w-full rounded-md bg-primary py-2 font-semibold text-white hover:bg-primary-dark">
          Create account
        </button>
      </form>
    </div>
  );
}
