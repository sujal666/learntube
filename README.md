# LearnTube AI

Monorepo-style workspace with a Next.js frontend and FastAPI backend tied together via Supabase Postgres + pgvector. Targets the stack in `agent.md`: Next.js (React/Tailwind/Recharts/React Player), FastAPI, Celery + Redis, Supabase, GPT-4/4o, Hugging Face/Sentence Transformers, Langfuse tracing, and YouTube Data API.

## Structure

- `frontend/` — Next.js 15 (TypeScript, Tailwind, React Compiler) with a Supabase browser provider plus Recharts/React Player dependencies.
- `backend/` — FastAPI service with Supabase service-role client, Celery + Redis wiring, and placeholders for ML/RAG/ingestion jobs.

## Quick start

- Frontend: `cd frontend && cp .env.example .env.local && npm install && npm run dev`
- Backend: `cd backend && python -m venv .venv && .\\.venv\\Scripts\\activate && pip install -r requirements.txt && cp .env.example .env && uvicorn app.main:app --reload --port 8000`
- Celery (once tasks are implemented): `celery -A app.worker.celery_app.celery_app worker --loglevel=info`

Set Supabase URL and keys in both env files (anon key for frontend, service role for backend). Add OpenAI/HuggingFace/YouTube keys and Langfuse if tracing is enabled.
