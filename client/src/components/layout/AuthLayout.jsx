import React from "react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left side: Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 md:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
          </div>

          <div className="mt-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Campus Image */}
      <div className="relative hidden w-0 flex-1 md:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/campus_bg.png"
          alt="Modern College Campus"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Empower Your Future
          </h1>
          <p className="mt-4 text-xl text-slate-300">
            Welcome to the premier placement portal. Connect with top employers, track applications, and secure your dream career.
          </p>
        </div>
      </div>
    </div>
  );
}
