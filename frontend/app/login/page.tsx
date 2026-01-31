"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabase } from "../providers";

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Logged in. Taking you home…");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        <div className="space-y-6 lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Secure login
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Welcome back to LearnTube</h1>
          <p className="text-slate-300">
            Use your Supabase credentials to continue your structured YouTube roadmaps with AI explanations.
          </p>
          <div className="grid gap-3 text-sm text-slate-200">
            <Feature text="Stay signed in across dashboard and onboarding" />
            <Feature text="Instantly resume recommendations" />
            <Feature text="Secure JWT flow from Supabase Auth" />
          </div>
          <Link href="/register" className="text-sm font-semibold text-emerald-200 hover:text-emerald-100">
            Need an account? Create one
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 lg:mt-0"
        >
          <h2 className="text-xl font-semibold text-white">Login</h2>
          <p className="mb-4 text-sm text-slate-300">Email + password (Supabase)</p>
          <div className="space-y-3">
            <label className="space-y-1 text-sm text-slate-200">
              <span>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-200">
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-200"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {error && <p className="text-red-300">{error}</p>}
            {message && <p className="text-emerald-200">{message}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-emerald-300" />
      <span>{text}</span>
    </div>
  );
}


