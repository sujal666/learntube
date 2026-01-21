'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 sm:px-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-200">Dashboard</p>
          <h1 className="text-3xl font-semibold">Your learning space</h1>
          <p className="text-sm text-slate-300">
            Onboarding is saved. We kicked off YouTube ingestion using your goals so recommendations have content to
            work with.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">What&apos;s next</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-100">
            <li className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" />
              <span>Browse ingested videos (videos_raw) and surface them here.</span>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" />
              <span>Add transcript/embedding enrichment next for recommendations.</span>
            </li>
          </ul>
        </section>

        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:border-white/40"
          >
            Back home
          </Link>
        </div>
      </main>
    </div>
  );
}
