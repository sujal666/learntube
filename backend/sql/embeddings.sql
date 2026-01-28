create extension if not exists vector;

create table if not exists public.video_embeddings (
  video_id text primary key references public.videos_raw(video_id) on delete cascade,
  embedding vector(384) not null,
  topics text[],
  difficulty text,
  sentiment_score numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_embeddings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goals text[],
  embedding vector(384) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.search_video_embeddings(query vector, _limit integer)
returns table(
  video_id text,
  similarity float,
  difficulty text,
  sentiment_score numeric,
  topic_tags text[]
) language sql stable as $$
  select
    ve.video_id,
    1 - (ve.embedding <=> query) as similarity,
    v.difficulty,
    v.sentiment_score,
    v.topic_tags
  from public.video_embeddings ve
  join public.videos_raw v on v.video_id = ve.video_id
  order by ve.embedding <=> query
  limit _limit;
$$;
