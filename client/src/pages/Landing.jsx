import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-lg font-bold text-primary">Placement Portal</div>
        <div className="flex gap-3 text-sm">
          <Link to="/student/login" className="rounded-md px-4 py-2 text-slate-700 hover:bg-slate-100">
            Student Login
          </Link>
          <Link
            to="/admin/login"
            className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
          >
            Staff Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            College Placement Management — built for real drives
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Students discover eligible companies, apply with confidence, and track interviews end-to-end. Staff orchestrate drives,
            validate criteria, analyse outcomes, and export reports backed by MongoDB-backed APIs.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/student/register"
              className="rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              Create Student Account
            </Link>
            <Link to="/student/login" className="rounded-md border border-slate-200 px-5 py-3 text-center text-sm font-semibold hover:bg-white">
              View opportunities
            </Link>
          </div>
          <dl className="mt-14 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <dt className="text-slate-500">Architecture</dt>
              <dd className="mt-2 font-semibold text-slate-900">REST + MVC</dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <dt className="text-slate-500">Security</dt>
              <dd className="mt-2 font-semibold text-slate-900">JWT + RBAC</dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <dt className="text-slate-500">Compliance</dt>
              <dd className="mt-2 font-semibold text-slate-900">Eligibility gates</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">Operational snapshot</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li>• Automated eligibility filtering (CGPA, backlogs, skills, department)</li>
            <li>• Resume ingestion with guarded Multer uploads</li>
            <li>• Interview rounds, reminders, notifications & admit exports</li>
            <li>• Admin dashboards with placements analytics & CSV/PDF artefacts</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
