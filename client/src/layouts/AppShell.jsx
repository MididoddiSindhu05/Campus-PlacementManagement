import { NavLink } from "react-router-dom";

export default function AppShell({ title, subtitle, nav, children, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="text-lg font-semibold text-primary">Placement Portal</div>
            <div className="text-xs text-slate-500">College operations</div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-teal-50 text-primary" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {onLogout && (
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </div>
          )}
        </aside>
        <main className="flex-1 overflow-x-auto">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                    isActive ? "bg-teal-100 text-primary" : "bg-slate-100 text-slate-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
