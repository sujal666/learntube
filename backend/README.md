## LearnTube Backend (FastAPI + Supabase + Celery)

FastAPI service coordinating Supabase (auth, storage, vectors) with background jobs for ingestion/embeddings via Celery + Redis. ML/NLP uses Hugging Face/Sentence Transformers; OpenAI for GPT-4/4o and RAG; Langfuse ready for tracing.

### Getting started

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ OPENAI/HF/YT keys, Redis URL)
uvicorn app.main:app --reload --port 8000
```

Start Celery (optional now, required once tasks are added):

```bash
celery -A app.worker.celery_app.celery_app worker --loglevel=info
```

### Layout

- `app/main.py`: FastAPI app factory + router registration.
- `app/api/routes.py`: Top-level router using `API_PREFIX` from settings.
- `app/api/v1/routes.py`: v1 endpoints (health + Supabase config check).
- `app/core/config.py`: Pydantic settings loader; reads `.env` (Supabase, Redis, OpenAI, Hugging Face, YouTube, Langfuse).
- `app/services/supabase_client.py`: Cached Supabase client using the service role key for backend operations.
- `app/worker/celery_app.py`: Celery configuration (Redis broker/result).
- `app/worker/tasks.py`: Placeholder task for embedding jobs.

### Notes

- Supabase (Postgres + pgvector) is the single vector store; use service role key only on the backend. Keep anon key for public/edge use.
- Add new routers under `app/api/v1/` (or bump the version) and include them in `routes.py`.
- Keep shared DTOs/schemas co-located in `app/schemas/` as endpoints are added.
- Wire observability (Langfuse/LangSmith) once GPT calls are introduced.

## YouTube ingestion (data first, no AI yet)

1) Create the raw videos table in Supabase (SQL editor):
```
-- backend/sql/videos_raw.sql
create table if not exists public.videos_raw (
  video_id text primary key,
  title text not null,
  description text,
  channel_title text,
  published_at timestamptz,
  duration_seconds integer,
  view_count bigint,
  like_count bigint,
  topics_source text[] not null default '{}',
  fetched_at timestamptz not null default now(),
  raw jsonb
);
```
2) Set `YOUTUBE_API_KEY` in `backend/.env` (Settings → API → select your YouTube key).
3) Start the API and call:
```
POST /api/v1/ingest/youtube
{
  "topics": ["machine learning", "react tutorial"],
  "max_results_per_topic": 5,
  "min_view_count": 1000,
  "max_age_days": 365
}
```
This fetches metadata via YouTube Data API and upserts into `videos_raw` (no embeddings yet).
