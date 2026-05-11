import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk, bootstrapAuth } from "../../store/slices/authSlice.js";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Student login</h1>
        <p className="mt-2 text-sm text-slate-500">Use your institute email credentials.</p>
        <label className="mt-8 block text-sm font-medium">
          Email
          <input
            {...register("email", { required: true })}
            type="email"
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            {...register("password", { required: true })}
            type="password"
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-6 flex justify-between text-xs">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <Link to="/student/register" className="font-medium text-slate-700 hover:text-slate-900">
            Need an account?
          </Link>
        </div>
        <button type="submit" className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          Continue
        </button>
      </form>
    </div>
  );
}
