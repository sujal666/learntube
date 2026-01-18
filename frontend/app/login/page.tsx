'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '../providers';

export default function LoginPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage('Logged in. You can return to Home.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-wide text-emerald-200">LearnTube</p>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-sm text-slate-300">Supabase Auth (email + password)</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Login
          </button>
          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm text-emerald-200">{message}</p>}
        </form>

        <div className="flex justify-between text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            ← Back home
          </Link>
          <Link href="/register" className="font-semibold text-emerald-200 hover:text-emerald-100">
            Go to register
          </Link>
        </div>
      </main>
    </div>
  );
}
