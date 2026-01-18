'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useSupabase } from './providers';

const flow = [
  'User signs up / logs in',
  'Supabase Auth handles authentication',
  'You receive user.id (JWT-based)',
  'FastAPI uses that user.id as the primary key',
  'All AI personalization is tied to that ID',
];

export default function Home() {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ?? null))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14 sm:px-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-emerald-200">
            <span className="rounded-full bg-emerald-500/10 px-3 py-1">LearnTube</span>
            <span className="rounded-full bg-sky-500/10 px-3 py-1">Supabase Auth</span>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1">FastAPI</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Simple auth handoff between Supabase and FastAPI.
            </h1>
            <p className="text-sm text-slate-200 sm:text-base">
              Log in or register with Supabase. We read the JWT, surface <code className="font-mono">user.id</code>,
              and pass it downstream so FastAPI can key all AI personalization on that ID.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:border-white/40"
            >
              Register
            </Link>
            {session && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-400/60 px-4 py-2 text-sm font-semibold text-red-100 hover:border-red-300 hover:text-white"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Auth chain</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-100">
            {flow.map((step, idx) => (
              <li key={step} className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2">
                <span className="mt-0.5 h-6 w-6 rounded-full bg-emerald-500/20 text-center text-xs font-semibold text-emerald-200 leading-6">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Session</h2>
          {loading ? (
            <p className="text-sm text-slate-200">Loading session…</p>
          ) : session ? (
            <div className="space-y-2 text-sm text-slate-100">
              <div>
                <span className="font-semibold text-emerald-200">user.id:</span>{' '}
                <code className="break-all font-mono text-emerald-100">{session.user.id}</code>
              </div>
              <div className="text-slate-300">
                Pass this ID to FastAPI as the primary key for all personalization and storage.
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-200">No active session. Please log in or register.</p>
          )}
        </section>
      </main>
    </div>
  );
}
