create table if not exists public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null references public.videos_raw(video_id) on delete cascade,
  feedback_type text not null check (feedback_type in ('helpful','not_helpful','too_easy','too_hard')),
  created_at timestamptz not null default now()
);

create index if not exists idx_recommendation_feedback_user_video on public.recommendation_feedback(user_id, video_id);
