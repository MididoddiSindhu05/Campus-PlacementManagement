import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk, bootstrapAuth } from "../../store/slices/authSlice.js";
import AuthLayout from "../../components/layout/AuthLayout.jsx";

export default function StudentLogin() {
  const { register, handleSubmit } = useForm({ defaultValues: { email: "", password: "" } });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);

  if (auth.user?.role === "student") return <Navigate to="/student/dashboard" replace />;

  async function onSubmit(values) {
    const p = toast.loading("Signing in…");
    try {
      await dispatch(loginThunk({ ...values, roleHint: "student" })).unwrap();
      await dispatch(bootstrapAuth()).unwrap();
      toast.success("Welcome back!", { id: p });
      navigate("/student/dashboard");
    } catch (e) {
      toast.error(e || "Unable to login", { id: p });
    }
  }

  return (
    <AuthLayout title="Student Login" subtitle="Access your campus placement dashboard.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200">Email Address</label>
          <input
            {...register("email", { required: true })}
            type="email"
            className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition-colors duration-200"
            placeholder="you@college.edu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">Password</label>
          <input
            {...register("password", { required: true })}
            type="password"
            className="mt-2 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 sm:text-sm transition-colors duration-200"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-teal-400 hover:text-teal-300 transition-colors">
            Forgot password?
          </Link>
          <Link to="/student/register" className="text-slate-300 hover:text-white transition-colors">
            Create an account
          </Link>
        </div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 transition-all duration-200 active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
