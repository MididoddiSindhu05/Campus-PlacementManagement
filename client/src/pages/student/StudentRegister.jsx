import { Navigate, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerThunk, bootstrapAuth } from "../../store/slices/authSlice.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";

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

  const inputClass = "mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition-colors duration-200";
  const labelClass = "block text-sm font-medium text-slate-200";

  return (
    <AuthLayout title="Student Registration" subtitle="Create your profile to get started.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input {...register("name", { required: true })} className={inputClass} placeholder="John Doe" />
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input {...register("email", { required: true })} type="email" className={inputClass} placeholder="john@college.edu" />
        </div>
        <div>
          <label className={labelClass}>Password (min 8 chars)</label>
          <input {...register("password", { required: true, minLength: 8 })} type="password" className={inputClass} placeholder="••••••••" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Roll Number</label>
            <input {...register("rollNumber", { required: true })} className={inputClass} placeholder="CS21001" />
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <input {...register("department")} className={inputClass} placeholder="CSE" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>CGPA</label>
            <input {...register("cgpa", { valueAsNumber: true })} step="0.01" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Backlogs</label>
            <input {...register("backlogs", { valueAsNumber: true })} type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Grad Year</label>
            <input {...register("graduationYear", { valueAsNumber: true })} type="number" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Skills (comma separated)</label>
          <input {...register("skillsInput")} className={inputClass} placeholder="React, Node.js, Python" />
        </div>

        <div className="pt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">Already have an account?</span>
          <Link to="/student/login" className="text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full justify-center rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 transition-all duration-200 active:scale-[0.98]"
        >
          Create Account
        </button>
      </form>
    </AuthLayout>
  );
}
