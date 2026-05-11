import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerAdminThunk, bootstrapAuth } from "../../store/slices/authSlice.js";

export default function AdminRegister() {
  const { register, handleSubmit } = useForm({
    defaultValues: { name: "", email: "", password: "", adminSecret: "" },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  if (user && (user.role === "admin" || user.role === "placement_officer")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(values) {
    const p = toast.loading("Registering admin account…");
    try {
      await dispatch(registerAdminThunk(values)).unwrap();
      await dispatch(bootstrapAuth()).unwrap();
      toast.success("Admin registered successfully", { id: p });
      navigate("/admin/dashboard");
    } catch (e) {
      toast.error(e || "Registration failed", { id: p });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-50 shadow-xl"
      >
        <h1 className="text-xl font-semibold tracking-tight">Admin Registration</h1>
        <p className="mt-2 text-sm text-slate-400">Create a new institutional staff account.</p>
        
        <label className="mt-8 block text-sm font-medium">
          Full Name
          <input
            {...register("name", { required: true })}
            type="text"
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        
        <label className="mt-4 block text-sm font-medium">
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
            {...register("password", { required: true, minLength: 8 })}
            type="password"
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        
        <label className="mt-4 block text-sm font-medium">
          Admin Secret Code
          <p className="text-xs text-slate-500 mb-1">Required to authorize creation of an admin account.</p>
          <input
            {...register("adminSecret", { required: true })}
            type="password"
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        
        <button type="submit" className="mt-8 w-full rounded-md bg-teal-500 py-2 text-sm font-semibold text-white hover:bg-teal-600">
          Create Account
        </button>
        
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-teal-400 hover:text-teal-300">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
