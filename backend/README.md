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
  difficulty text,
  difficulty_confidence numeric,
  sentiment_score numeric,
  comment_count_analyzed integer,
  topic_tags text[],
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

## NLP enrichment (difficulty, sentiment, topics)

1) Ensure `backend.sql/videos_raw.sql` is applied so the table stores difficulty + sentiment fields.
2) Set `YOUTUBE_API_KEY` in `backend/.env` (used for metadata and comments).
3) Call the enrichment endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/enrich/videos/{video_id}
```

4) The route runs Hugging Face zero-shot classifiers + sentiment pipelines, fetches top comments, and writes:
   - `difficulty` / `difficulty_confidence`
   - `sentiment_score` / `comment_count_analyzed`
   - `topic_tags`
5) Use these columns to filter recommendations before generating embeddings.

## Embeddings (pgvector)

1) Apply `backend/sql/embeddings.sql` after `videos_raw` is ready. It enables the `vector` extension, creates `video_embeddings` and `user_embeddings`, and adds the helper function for similarity searches.
2) Generate each video’s embedding once the metadata + NLP signals are written:

```bash
curl -X POST http://localhost:8000/api/v1/embeddings/videos/<video_id>
```

3) Generate a user intent embedding from onboarding for every learner:

```bash
curl -X POST http://localhost:8000/api/v1/embeddings/users/<user_id>
```

4) Request recommendations by comparing the user embedding to the stored vectors while filtering by quality/difficulty:

```bash
curl -X POST "http://localhost:8000/api/v1/embeddings/recommendations/<user_id>?limit=10&min_sentiment=0.5&difficulty_filter=Beginner"
```

5) The route uses pgvector’s `<=>` distance via `search_video_embeddings`, sorts by similarity, and only keeps videos that pass the sentiment and difficulty guardrails before returning the ranked list.

## RAG + GPT-4 explanations

1) Assemble deterministic context from `user_profiles`, `user_preferences`, `video_embeddings`, and `videos_raw`.
2) Warm the explanation service (requires `OPENAI_API_KEY` + optional Langfuse keys).
3) Explain a single video:

```bash
curl -X POST "http://localhost:8000/api/v1/explanations/video/{video_id}/user/{user_id}?similarity=0.27&min_sentiment=0.5"
```

4) The endpoint sends the context (goals, difficulty, sentiment, similarity) to GPT-4 and returns a human-friendly “why this video” explanation while streaming Langfuse traces (prompt, retrieval metadata, token usage).

## Full decision payload (accepted + rejected)

- `POST /api/v1/embeddings/recommendations/{user_id}` partitions results into `accepted`, `rejected`, and `explain_candidates` with rejection reasons (similarity/difficulty/sentiment).
- `POST /api/v1/explanations/recommendations/{user_id}` runs the same filters, then generates GPT-4 explanations for the top `explain_top` accepted items. Response includes:
  - `accepted`: all passing candidates
  - `rejected`: failed candidates + reasons
  - `explanations`: explanations for the top accepted items (cost-controlled)

## Feedback loop (rule-based)

1) Create the feedback table (SQL):
```
-- backend/sql/feedback.sql
create extension if not exists "uuid-ossp";
create table if not exists public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null references public.videos_raw(video_id) on delete cascade,
  feedback_type text not null check (feedback_type in ('helpful','not_helpful','too_easy','too_hard')),
  created_at timestamptz not null default now()
);
create index if not exists idx_recommendation_feedback_user_video on public.recommendation_feedback(user_id, video_id);
```
2) Record feedback:
```
POST /api/v1/feedback
{ "user_id": "...", "video_id": "...", "feedback_type": "helpful|not_helpful|too_easy|too_hard" }
```
3) Recommendations auto-adjust:
   - `too_easy` nudges toward harder difficulty, `too_hard` toward easier
   - `helpful/not_helpful` lowers/raises sentiment threshold slightly
4) Debug current tuning:
```
GET /api/v1/feedback-debug/{user_id}
```
