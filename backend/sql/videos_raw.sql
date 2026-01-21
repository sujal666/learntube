-- Videos raw metadata storage (no embeddings yet)
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

comment on table public.videos_raw is 'Raw YouTube metadata collected pre-ML/embeddings.';
