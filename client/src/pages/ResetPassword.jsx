import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, unwrap } from "../services/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const { register, handleSubmit } = useForm({ defaultValues: { password: "" } });

  async function onSubmit({ password }) {
    const id = toast.loading("Updating…");
    try {
      unwrap(await api.post("/api/auth/reset-password", { token, password }));
      toast.success("Password updated — sign in.", { id });
      navigate("/student/login");
    } catch (e) {
      toast.error(e.message, { id });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl border px-8 py-10 shadow-sm">
        <h1 className="text-xl font-semibold">Set new password</h1>
        <p className="mt-2 text-sm text-slate-600">{token ? "Token recognised." : "Missing token."}</p>
        <input
          type="password"
          {...register("password", { required: true, minLength: 8 })}
          className="mt-6 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="New password"
        />
        <button type="submit" className="mt-4 w-full rounded-md bg-primary py-2 text-sm font-semibold text-white">
          Save password
        </button>
        <Link to="/student/login" className="mt-4 block text-center text-sm text-primary">
          Cancel
        </Link>
      </form>
    </div>
  );
}
