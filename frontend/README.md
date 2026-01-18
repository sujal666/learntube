## LearnTube Frontend (Next.js 15 + Tailwind + React Compiler)

App Router scaffold with Supabase client wiring. Uses the new Tailwind v4 API and lives entirely under `app/`. Includes Recharts and React Player per the project stack.

### Getting started

1) Install deps (already installed if you ran the generator):

```bash
npm install
```

2) Copy env vars:

```bash
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3) Run the dev server:

```bash
npm run dev
```

Visit http://localhost:3000 to see the workspace shell.

### Structure highlights

- `app/providers.tsx`: Supabase browser client provider (public anon key).
- `lib/supabase/server.ts`: Server-side Supabase client (uses service role key when available).
- `app/page.tsx`: Landing shell describing the product areas; replace with real UX flows.
- Recharts + React Player installed for analytics and YouTube playback components.

### Notes

- Supabase replaces pgvector; use Supabase vectors/storage/auth for data + embeddings.
- Keep shared contracts in a common package or `backend/` when wiring FastAPI endpoints.
