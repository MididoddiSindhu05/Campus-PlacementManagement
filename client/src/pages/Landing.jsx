import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Placement Portal home">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-bold text-white">
              CP
            </span>
            <span className="text-base font-semibold">Campus Placement</span>
          </Link>
          <nav aria-label="Account links" className="flex items-center gap-2 text-sm sm:gap-4">
            <Link to="/student/login" className="rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">
              Student sign in
            </Link>
            <Link
              to="/admin/login"
              className="rounded-md bg-primary px-3 py-2 font-medium text-white hover:bg-primary-dark sm:px-4"
            >
              Staff sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid gap-12 border-b border-slate-200 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-20">
          <div className="flex flex-col items-start">
            <p className="mb-5 text-sm font-semibold text-primary">CAMPUS RECRUITMENT</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
              Your next opportunity starts here.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Find placement drives that fit your profile, apply in a few steps, and keep every interview update in one place.
            </p>
            <div className="mt-8 flex w-full flex-wrap gap-3">
              <Link
                to="/student/register"
                className="rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Create student account
              </Link>
              <Link
                to="/student/login"
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Browse opportunities
              </Link>
            </div>
          </div>

          <section aria-labelledby="journey-title" className="self-center">
            <h2 id="journey-title" className="mb-2 text-lg font-semibold">From drive to interview</h2>
            <p className="mb-4 text-sm text-slate-600">Everything you need to stay on top of placements.</p>
            <ol className="divide-y divide-slate-200 border-y border-slate-200">
              <li className="flex gap-4 py-4">
                <span className="pt-0.5 text-sm font-semibold text-primary" aria-hidden="true">01</span>
                <div>
                  <h3 className="text-sm font-semibold">Discover eligible drives</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">See opportunities matched to your profile and skills.</p>
                </div>
              </li>
              <li className="flex gap-4 py-4">
                <span className="pt-0.5 text-sm font-semibold text-primary" aria-hidden="true">02</span>
                <div>
                  <h3 className="text-sm font-semibold">Apply and follow progress</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Keep application status and next steps easy to find.</p>
                </div>
              </li>
              <li className="flex gap-4 py-4">
                <span className="pt-0.5 text-sm font-semibold text-primary" aria-hidden="true">03</span>
                <div>
                  <h3 className="text-sm font-semibold">Stay ready for interviews</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Check interview schedules, reminders, and updates.</p>
                </div>
              </li>
            </ol>
          </section>
        </section>

        <section className="flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600">Placement teams can manage drives, applicants, and interview rounds.</p>
          <Link to="/admin/login" className="font-semibold text-primary hover:text-primary-dark">
            Open staff portal <span aria-hidden="true">-&gt;</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
