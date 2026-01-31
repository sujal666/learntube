"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "../providers";
import Link from "next/link";

type RecItem = {
  video_id: string;
  title?: string | null;
  thumbnail?: string | null;
  similarity?: number | null;
  difficulty?: string | null;
  sentiment_score?: number | null;
  topic_tags?: string[] | null;
  accepted?: boolean;
};

type Profile = {
  goals?: string[];
  main_objective?: string | null;
  weekly_time?: string | null;
};

type Preferences = {
  skill_levels?: string[];
  learning_style?: string | null;
  preferred_video_length?: string | null;
};



const friendlyLabel = (value?: string | null) =>
  value?.replaceAll("_", " ") ?? "-";

export default function DashboardPage() {
  const supabase = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [recs, setRecs] = useState<RecItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "", []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setUserId(data.session?.user.id ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserId(session?.user.id ?? null),
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      try {
        const { data: profData } = await supabase
          .from("user_profiles")
          .select("goals, main_objective, weekly_time")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile(profData as Profile | null);

        const { data: prefData } = await supabase
          .from("user_preferences")
          .select(
            "skill_levels, learning_style, preferred_video_length, difficulty_preference",
          )
          .eq("user_id", userId)
          .maybeSingle();
        setPreferences(prefData as Preferences | null);

        const recRes = await fetch(
          `${apiBase}/api/v1/embeddings/recommendations/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );
        if (!recRes.ok) throw new Error("Failed to load recommendations");
        const recBody = await recRes.json();
        const list: RecItem[] = recBody?.accepted ?? [];

        const ids = list.map((v) => v.video_id);
        let metaMap: Record<string, { title?: string | null }> = {};
        if (ids.length) {
          const { data: meta } = await supabase
            .from("videos_raw")
            .select("video_id,title")
            .in("video_id", ids);
          metaMap = Object.fromEntries(
            (meta ?? []).map((m: { video_id: string; title?: string | null }) => [m.video_id, { title: m.title }]),
          );
        }

        const withMeta = list.map((v) => ({
          ...v,
          title: metaMap[v.video_id]?.title ?? v.video_id,
          thumbnail: `https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg`,
        }));

        setRecs(withMeta);
        setActiveVideo(withMeta[0]?.video_id ?? null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase, supabase, userId]);

  const active = recs.find((r) => r.video_id === activeVideo) ?? recs[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Your learning space</h1>
        </div>
        <Link
          href="/onboarding"
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--card-hover)] transition-colors"
        >
          Edit onboarding
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center p-6 text-sm text-[var(--muted)]">
            Loading…
          </div>
        ) : error ? (
          <div className="m-6 w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        ) : (
          <>
            {/* Left Column: Video + Details */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <div className="mx-auto max-w-6xl flex flex-col gap-6">
                
                {/* Video Player */}
                <section className="w-full">
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
                    {active?.video_id ? (
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${active.video_id}`}
                        title="Selected video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/70">
                        Pick a video
                      </div>
                    )}
                  </div>
                  {active && (
                    <div className="mt-4">
                      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                        {active.title ?? "Untitled Video"}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {active.difficulty && <Pill>{active.difficulty}</Pill>}
                        {typeof active.sentiment_score === "number" && (
                          <Pill>Sentiment {active.sentiment_score.toFixed(2)}</Pill>
                        )}
                        {active.topic_tags?.map((t) => (
                          <Pill key={t}>{t}</Pill>
                        ))}
                        {active.similarity && (
                          <Pill>
                            Similarity {(active.similarity * 100).toFixed(1)}%
                          </Pill>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* Structured Path */}
                <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                    Structured path preview
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      "HTML/CSS one-shot",
                      "JavaScript essentials",
                      "React basics",
                      "React advanced",
                      "React project build",
                    ].map((label, idx) => (
                      <div
                        key={label}
                        className="relative rounded-lg border border-[var(--border)] bg-slate-50 p-3 hover:bg-white hover:shadow-md transition-all group"
                      >
                         <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[var(--foreground)] leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Stats */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Goals" value={profile?.goals?.join(", ") || "-"} />
                  <Stat
                    label="Objective"
                    value={friendlyLabel(profile?.main_objective)}
                  />
                  <Stat
                    label="Weekly time"
                    value={friendlyLabel(profile?.weekly_time)}
                  />
                  <Stat
                    label="Skill level"
                    value={preferences?.skill_levels?.join(", ") || "-"}
                  />
                </section>
              </div>
            </div>

            {/* Right Column: Playlist */}
            <div className="w-[400px] shrink-0 overflow-y-auto border-l border-[var(--border)] bg-white p-4 hidden lg:block scrollbar-thin">
              <div className="mb-4 flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-[var(--foreground)]">Next Up</h2>
                 {/* <span className="switch-toggle text-xs px-2 py-1 bg-slate-100 rounded-full">Autoplay</span> */}
              </div>
              
              <div className="flex flex-col gap-3">
                {recs.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">
                    No recommendations yet.
                  </p>
                )}
                {recs.map((item) => (
                  <button
                    key={item.video_id}
                    onClick={() => setActiveVideo(item.video_id)}
                    className={`group flex w-full gap-2 rounded-lg p-2 text-left transition-colors ${
                       activeVideo === item.video_id ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      <img
                        src={item.thumbnail ?? `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`}
                        alt={item.title ?? item.video_id}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-start">
                      <span className={`line-clamp-2 text-sm font-medium leading-snug ${
                        activeVideo === item.video_id ? "text-black" : "text-[var(--foreground)]"
                      }`}>
                        {item.title ?? item.video_id}
                      </span>
                      <div className="mt-1 flex flex-col text-xs text-[var(--muted)]">
                         {item.difficulty && <span>{item.difficulty}</span>}
                         {typeof item.similarity === "number" && (
                           <span>Match: {(item.similarity * 100).toFixed(0)}%</span>
                         )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--accent-soft)]/50 border border-[var(--accent-soft)] px-3 py-1 text-xs text-slate-700 font-medium">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm hover:shadow-sm transition-shadow">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-bold">
        {label}
      </div>
      <div className="mt-1 text-base font-medium text-[var(--foreground)] truncate">{value}</div>
    </div>
  );
}


