import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AppShell from "../../layouts/AppShell.jsx";
import RequireAuth from "../../protectedRoutes/RequireAuth.jsx";
import { logout } from "../../store/slices/authSlice.js";
import { api } from "../../services/api.js";

const nav = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications", end: true },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/notifications", label: "Alerts" },
  { to: "/admin/reports", label: "Reports" },
];

export default function AdminApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      roundName: "Technical",
      scheduledAt: "",
      venue: "Lab Block A",
      meetingLink: "",
      instructions: "",
    },
  });

  async function load() {
    const res = await api.get("/api/applications?limit=50");
    setItems(res.data.data?.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function patchStatus(id, status) {
    const tid = toast.loading("Updating…");
    try {
      await api.patch(`/api/applications/${id}`, { status });
      toast.success("Record saved", { id: tid });
      load();
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  async function flagFraud(id, fraudFlag) {
    try {
      await api.patch(`/api/applications/${id}`, { fraudFlag });
      toast.success(fraudFlag ? "Flagged" : "Flag cleared");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function submitInterview(values) {
    if (!modal) return;
    const tid = toast.loading("Scheduling interview…");
    try {
      const payload = {
        ...values,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
      };
      await api.post(`/api/interviews/application/${modal}`, payload);
      toast.success("Interview stored", { id: tid });
      setModal(null);
      reset();
      load();
    } catch (e) {
      toast.error(e.message, { id: tid });
    }
  }

  return (
    <RequireAuth roles={["admin", "placement_officer"]}>
      <AppShell
        title="Application pipeline"
        subtitle="Operate shortlists with audit-friendly status transitions."
        nav={nav}
        onLogout={() => {
          dispatch(logout());
          navigate("/");
        }}
      >
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Drive</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{a.student?.user?.name}</div>
                    <div className="text-xs text-slate-500">{a.student?.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold">{a.placementDrive?.title}</div>
                    <div className="text-xs">{a.placementDrive?.company?.name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <select
                      className="rounded border px-2 py-1 text-xs"
                      value={a.status}
                      onChange={(e) => patchStatus(a._id, e.target.value)}
                    >
                      {["pending", "shortlisted", "rejected", "offered", "withdrawn"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {a.fraudFlag ? <span className="mt-2 block text-red-600">fraud flagged</span> : null}
                  </td>
                  <td className="px-4 py-3 space-y-2">
                    <button type="button" className="text-xs font-semibold text-primary underline" onClick={() => setModal(a._id)}>
                      Schedule interview
                    </button>
                    <button
                      type="button"
                      className="ml-2 text-xs font-semibold text-amber-600 underline"
                      onClick={() => flagFraud(a._id, !a.fraudFlag)}
                    >
                      Toggle fraud flag
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 bg-black/40 p-6">
            <form
              onSubmit={handleSubmit(submitInterview)}
              className="mx-auto mt-10 max-w-lg rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Interview slotting</h3>
                <button type="button" onClick={() => setModal(null)} className="text-sm text-slate-500">
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <input {...register("roundName", { required: true })} placeholder="Round" className="w-full rounded border px-3 py-2" />
                <input {...register("scheduledAt", { required: true })} type="datetime-local" className="w-full rounded border px-3 py-2" />
                <input {...register("venue")} placeholder="Venue" className="w-full rounded border px-3 py-2" />
                <input {...register("meetingLink")} placeholder="Meet link" className="w-full rounded border px-3 py-2" />
                <textarea {...register("instructions")} placeholder="Instructions" rows={3} className="w-full rounded border px-3 py-2" />
              </div>
              <button type="submit" className="mt-4 w-full rounded-md bg-primary py-2 font-semibold text-white">
                Save round
              </button>
            </form>
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}
