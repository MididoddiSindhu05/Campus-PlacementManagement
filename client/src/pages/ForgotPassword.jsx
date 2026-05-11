import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api } from "../services/api.js";

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm({ defaultValues: { email: "" } });

  async function onSubmit({ email }) {
    const id = toast.loading("Sending instructions…");
    try {
      await api.post("/api/auth/forgot-password", { email });
    } catch {
      /* noop — API always returns neutral message */
    } finally {
      toast.success("If the email exists, reset instructions were sent.", { id });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl border px-8 py-10 shadow-sm">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600">Provide your institute email.</p>
        <input {...register("email", { required: true })} className="mt-6 w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="mt-4 w-full rounded-md bg-primary py-2 text-sm font-semibold text-white">
          Send mail
        </button>
        <Link to="/student/login" className="mt-4 block text-center text-sm text-primary">
          Back to login
        </Link>
      </form>
    </div>
  );
}
