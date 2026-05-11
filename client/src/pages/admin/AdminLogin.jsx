import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk, bootstrapAuth } from "../../store/slices/authSlice.js";

export default function AdminLogin() {
  const { register, handleSubmit } = useForm({
    defaultValues: { email: "", password: "" },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  if (user && (user.role === "admin" || user.role === "placement_officer")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(values) {
    const p = toast.loading("Authenticating staff…");
    try {
      await dispatch(loginThunk({ ...values, roleHint: "admin" })).unwrap();
      await dispatch(bootstrapAuth()).unwrap();
      toast.success("Signed in", { id: p });
      navigate("/admin/dashboard");
    } catch (e) {
      toast.error(e || "Invalid credentials", { id: p });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-50 shadow-xl"
      >
        <h1 className="text-xl font-semibold tracking-tight">Staff / Placement officer</h1>
        <p className="mt-2 text-sm text-slate-400">Institutional SSO compatible credentials.</p>
        <label className="mt-8 block text-sm font-medium">
          Email
          <input
            {...register("email", { required: true })}
            type="email"
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            {...register("password", { required: true })}
            type="password"
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        <button type="submit" className="mt-8 w-full rounded-md bg-teal-500 py-2 text-sm font-semibold text-white hover:bg-teal-600">
          Enter dashboard
        </button>
        
        <div className="mt-6 text-center text-sm text-slate-400">
          Need an admin account?{" "}
          <Link to="/admin/register" className="text-teal-400 hover:text-teal-300">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
