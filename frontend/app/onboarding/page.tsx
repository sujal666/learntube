'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../providers';

type MultiOption = {
  label: string;
  value: string;
};

const learningGoals: MultiOption[] = [
  { label: 'Break into AI/ML', value: 'ai_career' },
  { label: 'Level up in Web Dev', value: 'web_dev' },
  { label: 'Data/Analytics', value: 'data' },
  { label: 'Cloud & DevOps', value: 'cloud' },
  { label: 'Hobby/Side projects', value: 'hobby' },
];

const mainObjectives: MultiOption[] = [
  { label: 'Career switch', value: 'career_switch' },
  { label: 'Upskilling in current role', value: 'upskilling' },
  { label: 'Academic prep', value: 'academic' },
  { label: 'Portfolio building', value: 'portfolio' },
];

const weeklyTime: MultiOption[] = [
  { label: '1-3 hrs/week', value: '1_3' },
  { label: '4-6 hrs/week', value: '4_6' },
  { label: '7-10 hrs/week', value: '7_10' },
  { label: '10+ hrs/week', value: '10_plus' },
];

const skillLevels: MultiOption[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const learningStyles: MultiOption[] = [
  { label: 'Project-based', value: 'project' },
  { label: 'Concept-first', value: 'concept' },
  { label: 'Hands-on demos', value: 'hands_on' },
  { label: 'Lecture/long-form', value: 'lecture' },
];

const videoLengths: MultiOption[] = [
  { label: '< 10 minutes', value: 'short' },
  { label: '10-30 minutes', value: 'medium' },
  { label: '30-60 minutes', value: 'long' },
  { label: '60+ minutes', value: 'very_long' },
];

const difficultyBias: MultiOption[] = [
  { label: 'Keep it easy', value: 'easy' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Challenge me', value: 'hard' },
];

export default function OnboardingPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [mainObjective, setMainObjective] = useState<string>('');
  const [timeCommitment, setTimeCommitment] = useState<string>('');
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<string[]>([]);
  const [preferredLength, setPreferredLength] = useState<string>('');
  const [learningStyle, setLearningStyle] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('balanced');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUserId(data.session?.user.id ?? null);
      })
      .finally(() => setLoadingSession(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setUserId(newSession?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const apiEndpoint = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    return `${base}/api/v1/onboarding`;
  }, []);

  const toggle = (current: string[], value: string) =>
    current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!userId) {
      setError('You need to be logged in to complete onboarding.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

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
        },
      };

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to save onboarding data.');
      }

      setStatus('Onboarding saved. Redirecting to dashboard...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-emerald-200">Onboarding</p>
          <h1 className="text-3xl font-semibold">Tell us how you want to learn</h1>
          <p className="text-sm text-slate-300">
            Your answers feed Supabase (user_profiles + user_preferences) so FastAPI can personalize with your{' '}
            <code className="font-mono text-emerald-100">user.id</code>.
          </p>
          {!loadingSession && !userId && (
            <p className="text-sm text-red-300">You are not logged in. Please log in first.</p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Fieldset title="Learning goals" hint="Pick one or more">
              <CheckboxGroup
                options={learningGoals}
                selected={selectedGoals}
                onToggle={(val) => setSelectedGoals((cur) => toggle(cur, val))}
              />
            </Fieldset>
            <Fieldset title="Primary objective">
              <RadioGroup
                options={mainObjectives}
                selected={mainObjective}
                onSelect={setMainObjective}
              />
            </Fieldset>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Fieldset title="Weekly time">
              <RadioGroup options={weeklyTime} selected={timeCommitment} onSelect={setTimeCommitment} />
            </Fieldset>
            <Fieldset title="Skill level (self-assessed)" hint="Pick one or more if mixed">
              <CheckboxGroup
                options={skillLevels}
                selected={selectedSkillLevels}
                onToggle={(val) => setSelectedSkillLevels((cur) => toggle(cur, val))}
              />
            </Fieldset>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fieldset title="Preferred video length">
              <RadioGroup options={videoLengths} selected={preferredLength} onSelect={setPreferredLength} />
            </Fieldset>
            <Fieldset title="Learning style">
              <RadioGroup options={learningStyles} selected={learningStyle} onSelect={setLearningStyle} />
            </Fieldset>
            <Fieldset title="Difficulty bias">
              <RadioGroup options={difficultyBias} selected={difficulty} onSelect={setDifficulty} />
            </Fieldset>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting || !userId}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-emerald-200"
            >
              {submitting ? 'Saving…' : 'Save and continue'}
            </button>
            {status && <p className="text-sm text-emerald-200">{status}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
        </form>
      </main>
    </div>
  );
}

function Fieldset({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-white/10 bg-black/10 p-4">
      <legend className="px-2 text-sm font-semibold text-white">{title}</legend>
      {hint && <p className="px-2 pb-2 text-xs text-slate-300">{hint}</p>}
      {children}
    </fieldset>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: MultiOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
            className="h-4 w-4 rounded border-white/20 bg-slate-900 text-emerald-500 focus:ring-emerald-400"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function RadioGroup({
  options,
  selected,
  onSelect,
}: {
  options: MultiOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
          <input
            type="radio"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => onSelect(opt.value)}
            className="h-4 w-4 border-white/20 text-emerald-500 focus:ring-emerald-400"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
