"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../providers";

const stepTitles = [
  "What brings you here?",
  "Career objective + weekly time",
  "Skill level",
  "Format & difficulty",
  "Learning rhythm",
  "Review & launch",
] as const;

type Step = 0 | 1 | 2 | 3 | 4 | 5;

type MultiOption = { label: string; value: string };

const learningGoals: MultiOption[] = [
  { label: "Break into AI/ML", value: "ai_career" },
  { label: "Level up in Web Dev", value: "web_dev" },
  { label: "Data / Analytics", value: "data" },
  { label: "Cloud & DevOps", value: "cloud" },
  { label: "Hobby / Side projects", value: "hobby" },
];

const mainObjectives: MultiOption[] = [
  { label: "Career switch", value: "career_switch" },
  { label: "Upskilling in current role", value: "upskilling" },
  { label: "Academic prep", value: "academic" },
  { label: "Portfolio building", value: "portfolio" },
];

const weeklyTime: MultiOption[] = [
  { label: "1-3 hrs/week", value: "1_3" },
  { label: "4-6 hrs/week", value: "4_6" },
  { label: "7-10 hrs/week", value: "7_10" },
  { label: "10+ hrs/week", value: "10_plus" },
];

const skillLevels: MultiOption[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const learningStyles: MultiOption[] = [
  { label: "Project-based", value: "project" },
  { label: "Concept-first", value: "concept" },
  { label: "Hands-on demos", value: "hands_on" },
  { label: "Lecture / long-form", value: "lecture" },
];

const videoLengths: MultiOption[] = [
  { label: "< 10 minutes", value: "short" },
  { label: "10-30 minutes", value: "medium" },
  { label: "30-60 minutes", value: "long" },
  { label: "60+ minutes", value: "very_long" },
];

const difficultyBias: MultiOption[] = [
  { label: "Keep it easy", value: "easy" },
  { label: "Balanced", value: "balanced" },
  { label: "Challenge me", value: "hard" },
];

const learningRhythms: MultiOption[] = [
  { label: "Morning sessions", value: "morning" },
  { label: "Evening sessions", value: "evening" },
  { label: "Weekend deep work", value: "weekend" },
  { label: "Whenever I can", value: "flex" },
];

export default function OnboardingPage() {
  const supabase = useSupabase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(0);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [mainObjective, setMainObjective] = useState<string>("");
  const [timeCommitment, setTimeCommitment] = useState<string>("");
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);
  const [preferredLength, setPreferredLength] = useState<string>("");
  const [learningStyle, setLearningStyle] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("balanced");
  const [learningRhythm, setLearningRhythm] = useState<string>("flex");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<
    | { visible: true; message: string; sub?: string; progress: number; detailList: string[] }
    | { visible: false }
  >({ visible: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL ?? "", []);
  const apiEndpoint = `${apiBase}/api/v1/onboarding`;

  const toggle = (current: string[], value: string) =>
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

  const disableNext = () => {
    if (step === 0) return selectedGoals.length === 0;
    if (step === 1) return !mainObjective || !timeCommitment;
    if (step === 2) return selectedSkillLevels.length === 0;
    if (step === 3) return !preferredLength || !learningStyle;
    return false;
  };

  const nextStep = () => setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  const prevStep = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  const handleSubmit = async () => {
    setError(null);
    if (!userId) {
      setError("You need to be logged in to complete onboarding.");
      return;
    }
    setSubmitting(true);
    const accessToken = (await supabase.auth.getSession()).data.session?.access_token;

    const payload = {
      user_id: userId,
      user_profiles: {
        goals: selectedGoals,
        main_objective: mainObjective,
        weekly_time: timeCommitment,
      },
      user_preferences: {
        skill_levels: selectedSkillLevels,
        preferred_video_length: preferredLength,
        learning_style: learningStyle,
        difficulty_preference: difficulty,
        learning_rhythm: learningRhythm,
      },
    };

    const topics = selectedGoals.length ? selectedGoals : mainObjective ? [mainObjective] : [];
    const steps = [
      "Saving your preferences",
      "Pulling YouTube",
      "Enriching videos",
      "Building embeddings",
      "Ranking best matches",
    ];
    const showOverlay = (i: number, sub?: string) =>
      setOverlay({ visible: true, message: steps[i] ?? "Working", sub, progress: i / steps.length, detailList: topics });

    try {
      showOverlay(0);
      await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to save onboarding");
      });

      if (topics.length) {
        showOverlay(1, `Topics: ${topics.join(", ")}`);
        await fetch(`${apiBase}/api/v1/workflow/onboarding-refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            topics,
            max_results_per_topic: 5,
            min_view_count: 500,
            max_age_days: 365,
            order: "date",
            refresh: true,
          }),
        });
      }

      showOverlay(4, "Almost done");
      setTimeout(() => router.push("/dashboard"), 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setOverlay({ visible: false });
    } finally {
      setSubmitting(false);
    }
  };

  const stepCards = [
    {
      title: stepTitles[0],
      body: (
        <CheckboxGroup options={learningGoals} selected={selectedGoals} onToggle={(v) => setSelectedGoals((c) => toggle(c, v))} />
      ),
    },
    {
      title: stepTitles[1],
      body: (
        <div className="grid gap-4 sm:grid-cols-2">
          <RadioGroup options={mainObjectives} selected={mainObjective} onSelect={setMainObjective} />
          <RadioGroup options={weeklyTime} selected={timeCommitment} onSelect={setTimeCommitment} />
        </div>
      ),
    },
    {
      title: stepTitles[2],
      body: (
        <CheckboxGroup
          options={skillLevels}
          selected={selectedSkillLevels}
          onToggle={(v) => setSelectedSkillLevels((c) => toggle(c, v))}
        />
      ),
    },
    {
      title: stepTitles[3],
      body: (
        <div className="grid gap-4 sm:grid-cols-3">
          <RadioGroup options={videoLengths} selected={preferredLength} onSelect={setPreferredLength} />
          <RadioGroup options={learningStyles} selected={learningStyle} onSelect={setLearningStyle} />
          <RadioGroup options={difficultyBias} selected={difficulty} onSelect={setDifficulty} />
        </div>
      ),
    },
    {
      title: stepTitles[4],
      body: <RadioGroup options={learningRhythms} selected={learningRhythm} onSelect={setLearningRhythm} />,
    },
    {
      title: stepTitles[5],
      body: (
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <SummaryRow label="Goals" value={selectedGoals.join(", ") || "Not set"} />
          <SummaryRow label="Objective" value={mainObjective || "Not set"} />
          <SummaryRow label="Weekly time" value={timeCommitment || "Not set"} />
          <SummaryRow label="Skill levels" value={selectedSkillLevels.join(", ") || "Not set"} />
          <SummaryRow label="Preferred length" value={preferredLength || "Not set"} />
          <SummaryRow label="Learning style" value={learningStyle || "Not set"} />
          <SummaryRow label="Difficulty bias" value={difficulty || "Not set"} />
          <SummaryRow label="Learning rhythm" value={learningRhythm || "Not set"} />
          <p className="pt-2 text-[var(--foreground)]">
            We will save ➜ ingest YouTube ➜ enrich ➜ embed ➜ rank and send you to your dashboard.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">Onboarding</p>
          <h1 className="text-3xl font-semibold">Tell us how you want to learn</h1>
          <p className="text-sm text-[var(--muted)]">
            Your answers feed Supabase so FastAPI personalizes everything by your user.id.
          </p>
          {!userId && <p className="text-sm text-red-500">You are not logged in. Please log in first.</p>}
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white/70 p-6 shadow-[var(--shadow)] backdrop-blur">
          <div className="absolute -left-20 -top-24 h-52 w-52 rounded-full bg-[var(--accent)]/15 blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-[var(--muted)]/20 blur-3xl" />

          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--foreground)]">Step {step + 1} / {stepCards.length}</div>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-[var(--border)]">
                  <div
                    className="h-2 rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${((step + 1) / stepCards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4 shadow-[var(--shadow)]">
              <div className="mb-3 text-lg font-semibold text-[var(--foreground)]">{stepCards[step].title}</div>
              {stepCards[step].body}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0 || submitting}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--accent)] disabled:cursor-not-allowed"
              >
                Back
              </button>

              {step < stepCards.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={disableNext() || submitting}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow)] hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[var(--muted)]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !userId}
                  className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow)] hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[var(--muted)]"
                >
                  {submitting ? "Saving…" : "Launch my plan"}
                </button>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </section>
      </main>

      {overlay.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white/90 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-3 w-3 animate-ping rounded-full bg-[var(--accent)]" />
              <div>
                <div className="text-sm uppercase tracking-wide text-[var(--accent)]">Personalizing</div>
                <div className="text-lg font-semibold text-[var(--foreground)]">{overlay.message}</div>
                {overlay.sub && <div className="text-xs text-[var(--muted)]">{overlay.sub}</div>}
              </div>
            </div>
            <div className="mb-4 h-2 w-full rounded-full bg-[var(--border)]">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${Math.min(overlay.progress * 100 + 15, 100)}%` }}
              />
            </div>
            <div className="space-y-1 text-xs text-[var(--muted)]">
              <div className="text-[var(--foreground)]">Live feed</div>
              {overlay.detailList.length ? (
                <ul className="list-disc pl-4">
                  {overlay.detailList.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p>Crunching signals…</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({ options, selected, onToggle }: { options: MultiOption[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors ${
            selected.includes(opt.value)
              ? "bg-black text-white"
              : "bg-white/70 text-[var(--foreground)] hover:bg-white"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
            className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function RadioGroup({ options, selected, onSelect }: { options: MultiOption[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors ${
            selected === opt.value
              ? "bg-black text-white"
              : "bg-white/70 text-[var(--foreground)] hover:bg-white"
          }`}
        >
          <input
            type="radio"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onSelect(opt.value)}
            className="h-4 w-4 border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-[var(--foreground)] font-semibold">{value}</span>
    </div>
  );
}
