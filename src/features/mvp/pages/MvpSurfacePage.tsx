import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

import { getMvpSurfaces } from '@/features/mvp/data';
import { mvpApi } from '@/features/mvp/api/mvp.api';
import { useMvpStore } from '@/features/mvp/store/useMvpStore';
import { trackMvpSurfaceViewed } from '@/features/mvp/lib/telemetry';
import type { MvpAdminOverview, MvpSurface } from '@/features/mvp/types';
import { PageTitle } from '@/shared/ui/PageTitle';
import { Card, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input, TextArea } from '@/shared/ui/Input';

interface MvpSurfacePageProps {
  surface: MvpSurface['slug'];
}

const surfaceCopy: Record<MvpSurface['slug'], { guidanceTitle: string; focus: string[]; outcome: string }> = {
  'onboarding': {
    guidanceTitle: 'Build your starting context',
    focus: [
      'Name the goals that deserve attention this week.',
      'Add the commitments that already claim your time.',
      'Include real constraints so the plan stays achievable.',
    ],
    outcome: 'Saving this opens Weekly Review with the context it needs.',
  },
  'weekly-review': {
    guidanceTitle: 'Shape a realistic week',
    focus: [
      'Bring forward only the unfinished work that still matters.',
      'Choose one focus and keep the priority list deliberately small.',
      'Confirm the plan only when the week feels achievable.',
    ],
    outcome: 'Confirming the plan opens Today with a short list of next actions.',
  },
  today: {
    guidanceTitle: "Work from today's next actions",
    focus: [
      'Start with the next action under each confirmed priority.',
      'Complete or defer work without rebuilding the whole plan.',
      'Save a short check-in when context changes during the day.',
    ],
    outcome: 'Completing the work makes Reflection the next useful step.',
  },
  reflection: {
    guidanceTitle: 'Close the loop',
    focus: [
      'Capture what helped the week move forward.',
      'Record friction worth accounting for next time.',
      'Keep the reflection brief enough to repeat every week.',
    ],
    outcome: 'Your reflections become context for the next Weekly Review.',
  },
  admin: {
    guidanceTitle: 'Internal product signals',
    focus: [
      'Track activation, weekly review completion, retention, and feedback.',
      'Make design-partner friction visible without log diving.',
      'Keep this view internal only.',
    ],
    outcome: 'Use these signals to prioritize the next validated product change.',
  },
};

function parseLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLines(value: string[]) {
  return value.join('\n');
}

function OnboardingSurface() {
  const onboarding = useMvpStore((state) => state.onboarding);
  const saveOnboarding = useMvpStore((state) => state.saveOnboarding);
  const [displayName, setDisplayName] = useState(onboarding.displayName);
  const [role, setRole] = useState(onboarding.role);
  const [lifeSeason, setLifeSeason] = useState(onboarding.lifeSeason);
  const [planningPain, setPlanningPain] = useState(onboarding.planningPain);
  const [successDefinition, setSuccessDefinition] = useState(onboarding.successDefinition);
  const [goals, setGoals] = useState(formatLines(onboarding.goals));
  const [commitments, setCommitments] = useState(formatLines(onboarding.commitments));
  const [constraints, setConstraints] = useState(formatLines(onboarding.constraints));

  return (
    <Card className="space-y-5">
      <CardHeader>
        <CardTitle>Onboarding intake</CardTitle>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Input aria-label="Display name" placeholder="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        <Input aria-label="Role" placeholder="Role" value={role} onChange={(event) => setRole(event.target.value)} />
        <Input aria-label="Life season" placeholder="Life season" value={lifeSeason} onChange={(event) => setLifeSeason(event.target.value)} />
        <Input
          aria-label="Success definition for this season"
          placeholder="Success definition for this season"
          value={successDefinition}
          onChange={(event) => setSuccessDefinition(event.target.value)}
        />
      </div>

      <TextArea
        aria-label="What is breaking in the current planning system?"
        placeholder="What is breaking in the current planning system?"
        value={planningPain}
        onChange={(event) => setPlanningPain(event.target.value)}
      />
      <TextArea
        aria-label="Goals"
        placeholder="Goals, one per line"
        value={goals}
        onChange={(event) => setGoals(event.target.value)}
      />
      <TextArea
        aria-label="Recurring commitments"
        placeholder="Recurring commitments, one per line"
        value={commitments}
        onChange={(event) => setCommitments(event.target.value)}
      />
      <TextArea
        aria-label="Constraints or realities"
        placeholder="Constraints or realities, one per line"
        value={constraints}
        onChange={(event) => setConstraints(event.target.value)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() =>
            saveOnboarding({
              displayName,
              role,
              lifeSeason,
              planningPain,
              successDefinition,
              goals: parseLines(goals),
              commitments: parseLines(commitments),
              constraints: parseLines(constraints),
            })
          }
        >
          Save intake
        </Button>
        {onboarding.completedAt ? (
          <span role="status" className="text-sm text-emerald-300">Saved. Continue to weekly review when ready.</span>
        ) : (
          <span className="text-sm text-zinc-400">This creates the structured context for the first weekly plan.</span>
        )}
      </div>
    </Card>
  );
}

function WeeklyReviewSurface() {
  const review = useMvpStore((state) => state.review);
  const plan = useMvpStore((state) => state.plan);
  const runWeeklyReview = useMvpStore((state) => state.runWeeklyReview);
  const confirmPlan = useMvpStore((state) => state.confirmPlan);
  const [wins, setWins] = useState(formatLines(review.wins));
  const [unfinishedWork, setUnfinishedWork] = useState(formatLines(review.unfinishedWork));
  const [constraints, setConstraints] = useState(formatLines(review.constraints));
  const [focusArea, setFocusArea] = useState(review.focusArea);
  const [energyLevel, setEnergyLevel] = useState(String(review.energyLevel));
  const [notes, setNotes] = useState(review.notes);

  return (
    <div className="space-y-4">
      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Weekly review draft</CardTitle>
        </CardHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Input aria-label="Primary focus area" placeholder="Primary focus area" value={focusArea} onChange={(event) => setFocusArea(event.target.value)} />
          <Input
            aria-label="Energy level"
            placeholder="Energy level 1-5"
            type="number"
            min={1}
            max={5}
            value={energyLevel}
            onChange={(event) => setEnergyLevel(event.target.value)}
          />
        </div>

        <TextArea aria-label="Wins from the previous cycle" placeholder="Wins from the previous cycle, one per line" value={wins} onChange={(event) => setWins(event.target.value)} />
        <TextArea
          aria-label="Unfinished work still pulling attention"
          placeholder="Unfinished work still pulling attention, one per line"
          value={unfinishedWork}
          onChange={(event) => setUnfinishedWork(event.target.value)}
        />
        <TextArea
          aria-label="Constraints for this week"
          placeholder="Constraints for this week, one per line"
          value={constraints}
          onChange={(event) => setConstraints(event.target.value)}
        />
        <TextArea aria-label="Notes that should shape the plan" placeholder="Notes that should shape the plan" value={notes} onChange={(event) => setNotes(event.target.value)} />

        <Button
          variant={plan.generatedAt ? 'secondary' : 'primary'}
          onClick={() =>
            runWeeklyReview({
              wins: parseLines(wins),
              unfinishedWork: parseLines(unfinishedWork),
              constraints: parseLines(constraints),
              focusArea,
              energyLevel: Number(energyLevel) || 3,
              notes,
            })
          }
        >
          Generate weekly plan
        </Button>
      </Card>

      {plan.generatedAt ? (
        <Card className="space-y-5">
          <CardHeader>
            <CardTitle>Generated weekly plan</CardTitle>
          </CardHeader>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">{plan.summary}</div>

          <div className="space-y-3">
            {plan.priorities.map((priority) => (
              <div key={priority.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{priority.title}</h3>
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">{priority.actions.length} actions</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{priority.rationale}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-primary">{priority.successMetric}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => confirmPlan()} disabled={Boolean(plan.confirmedAt)}>
              {plan.confirmedAt ? 'Plan confirmed' : 'Confirm weekly plan'}
            </Button>
            <span role="status" className="text-sm text-zinc-400">
              {plan.confirmedAt ? 'The week is now active. Move to Today to execute.' : 'Review the priorities, then lock the week.'}
            </span>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function TodaySurface() {
  const plan = useMvpStore((state) => state.plan);
  const dailyCheckIns = useMvpStore((state) => state.dailyCheckIns);
  const updateActionStatus = useMvpStore((state) => state.updateActionStatus);
  const saveDailyCheckIn = useMvpStore((state) => state.saveDailyCheckIn);
  const today = new Date().toISOString().slice(0, 10);
  const currentCheckIn = dailyCheckIns.find((entry) => entry.date === today);
  const [energy, setEnergy] = useState(String(currentCheckIn?.energy ?? 3));
  const [focus, setFocus] = useState(String(currentCheckIn?.focus ?? 3));
  const [blockers, setBlockers] = useState(currentCheckIn?.blockers ?? '');
  const [note, setNote] = useState(currentCheckIn?.note ?? '');

  const totals = useMemo(() => {
    const totalActions = plan.priorities.reduce((sum, priority) => sum + priority.actions.length, 0);
    const completedActions = plan.priorities.reduce(
      (sum, priority) => sum + priority.actions.filter((action) => action.status === 'done').length,
      0
    );

    return { totalActions, completedActions };
  }, [plan.priorities]);

  if (!plan.confirmedAt) {
    return (
      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Today view locked</CardTitle>
        </CardHeader>
        <p className="text-sm leading-6 text-zinc-300">
          Confirm a weekly plan first. The daily view stays narrow on purpose and only opens once the week has been explicitly committed.
        </p>
        <Button asChild>
          <Link to="/mvp/weekly-review">Return to weekly review</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Daily execution board</CardTitle>
        </CardHeader>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Week progress</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {totals.completedActions} / {totals.totalActions || 0}
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-3">
          {plan.priorities.map((priority) => (
            <div key={priority.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-base font-semibold text-white">{priority.title}</h3>
              <div className="mt-4 space-y-3">
                {priority.actions.map((action) => (
                  <div key={action.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-zinc-100">{action.title}</p>
                        <p className="mt-1 text-xs text-zinc-400">{action.details}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">{action.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => updateActionStatus(priority.id, action.id, { status: 'done' })}>
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateActionStatus(priority.id, action.id, { status: 'deferred' })}>
                        Defer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateActionStatus(priority.id, action.id, { status: 'todo' })}>
                        Reset
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Daily check-in</CardTitle>
        </CardHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <Input aria-label="Energy level today" type="number" min={1} max={5} value={energy} onChange={(event) => setEnergy(event.target.value)} placeholder="Energy 1-5" />
          <Input aria-label="Focus level today" type="number" min={1} max={5} value={focus} onChange={(event) => setFocus(event.target.value)} placeholder="Focus 1-5" />
        </div>
        <TextArea aria-label="Blockers" placeholder="Blockers" value={blockers} onChange={(event) => setBlockers(event.target.value)} />
        <TextArea aria-label="Execution note" placeholder="Execution note" value={note} onChange={(event) => setNote(event.target.value)} />

        <Button
          onClick={() =>
            saveDailyCheckIn({
              date: today,
              energy: Number(energy) || 3,
              focus: Number(focus) || 3,
              blockers,
              note,
            })
          }
        >
          Save daily check-in
        </Button>
      </Card>
    </div>
  );
}

function ReflectionSurface() {
  const reflections = useMvpStore((state) => state.reflections);
  const feedback = useMvpStore((state) => state.feedback);
  const addReflection = useMvpStore((state) => state.addReflection);
  const submitFeedback = useMvpStore((state) => state.submitFeedback);
  const [dailyReflection, setDailyReflection] = useState('');
  const [weeklyReflection, setWeeklyReflection] = useState('');
  const [rating, setRating] = useState('4');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-4">
      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Reflection capture</CardTitle>
        </CardHeader>

        <TextArea aria-label="Daily reflection" placeholder="Daily reflection" value={dailyReflection} onChange={(event) => setDailyReflection(event.target.value)} />
        <Button onClick={() => { if (dailyReflection.trim()) { addReflection('daily', dailyReflection.trim()); setDailyReflection(''); } }}>
          Save daily reflection
        </Button>

        <TextArea aria-label="Weekly reflection" placeholder="Weekly reflection" value={weeklyReflection} onChange={(event) => setWeeklyReflection(event.target.value)} />
        <Button variant="secondary" onClick={() => { if (weeklyReflection.trim()) { addReflection('weekly', weeklyReflection.trim()); setWeeklyReflection(''); } }}>
          Save weekly reflection
        </Button>
      </Card>

      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Product feedback</CardTitle>
        </CardHeader>

        <Input aria-label="Rating" type="number" min={1} max={5} value={rating} onChange={(event) => setRating(event.target.value)} placeholder="Rating 1-5" />
        <TextArea aria-label="What created clarity or friction?" placeholder="What created clarity or friction?" value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button
          variant="outline"
          onClick={() => {
            if (message.trim()) {
              submitFeedback(Number(rating) || 4, message.trim());
              setMessage('');
            }
          }}
        >
          Submit feedback
        </Button>
      </Card>

      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>Captured signal</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Reflections</p>
            <p className="mt-2 text-2xl font-semibold text-white">{reflections.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Feedback entries</p>
            <p className="mt-2 text-2xl font-semibold text-white">{feedback.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminSurface() {
  const [overview, setOverview] = useState<MvpAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void mvpApi.getAdminOverview()
      .then((result) => {
        if (active) setOverview(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Administrative access denied.');
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <Card role="alert" className="p-5 text-sm text-rose-300">Administrative overview unavailable: {error}</Card>;
  }

  if (!overview) {
    return <Card role="status" className="p-5 text-sm text-zinc-300">Loading protected administrative overview…</Card>;
  }

  const { analytics, events, feedback } = overview;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Activation</p>
          <p className="mt-3 text-3xl font-semibold text-white">{analytics.onboardingCompleted ? 'Complete' : 'Pending'}</p>
          <p className="mt-2 text-sm text-zinc-400">Did the operator finish onboarding?</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Plan state</p>
          <p className="mt-3 text-3xl font-semibold text-white">{analytics.weeklyPlanConfirmed ? 'Confirmed' : 'Draft'}</p>
          <p className="mt-2 text-sm text-zinc-400">Has the week been explicitly committed?</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Action completion</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {analytics.completedActions}/{analytics.totalActions || 0}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Closed action items in the active plan.</p>
        </Card>
      </section>

      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Event stream</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.slice().reverse().map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                <span>{event.type}</span>
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">{new Date(event.createdAt).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No analytics events captured yet.</p>
          )}
        </div>
      </Card>

      <Card className="space-y-5">
        <CardHeader>
          <CardTitle>Qualitative feedback</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {feedback.length > 0 ? (
            feedback.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-100">Rating {entry.rating}/5</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{entry.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-400">No feedback entries yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export function MvpSurfacePage({ surface }: MvpSurfacePageProps) {
  const hydrateWorkspace = useMvpStore((state) => state.hydrateWorkspace);
  const isHydrating = useMvpStore((state) => state.isHydrating);
  const error = useMvpStore((state) => state.error);
  const mvpSurfaces = useMemo(() => getMvpSurfaces(surface === 'admin'), [surface]);
  const currentIndex = mvpSurfaces.findIndex((item) => item.slug === surface);
  const current = mvpSurfaces[currentIndex];
  const previous = currentIndex > 0 ? mvpSurfaces[currentIndex - 1] : null;
  const next = currentIndex < mvpSurfaces.length - 1 ? mvpSurfaces[currentIndex + 1] : null;
  const copy = surfaceCopy[surface];
  const getAnalytics = useMvpStore((state) => state.getAnalytics);
  const analytics = getAnalytics();

  useEffect(() => {
    if (surface !== 'admin') {
      void hydrateWorkspace();
    }
  }, [hydrateWorkspace, surface]);

  useEffect(() => {
    trackMvpSurfaceViewed(surface);
  }, [surface]);

  const activeSummary = {
    onboarding: analytics.onboardingCompleted ? 'Saved' : 'Pending',
    'weekly-review': analytics.weeklyPlanConfirmed ? 'Confirmed' : analytics.eventCounts.weekly_plan_generated > 0 ? 'Generated' : 'Pending',
    today: analytics.totalActions > 0 ? `${analytics.completedActions}/${analytics.totalActions} done` : 'Pending',
    reflection: analytics.reflections > 0 ? `${analytics.reflections} saved` : 'Pending',
    admin: 'Protected',
  } satisfies Record<MvpSurface['slug'], string>;

  const content = {
    onboarding: <OnboardingSurface />,
    'weekly-review': <WeeklyReviewSurface />,
    today: <TodaySurface />,
    reflection: <ReflectionSurface />,
    admin: <AdminSurface />,
  } satisfies Record<MvpSurface['slug'], JSX.Element>;

  return (
    <div className="space-y-8">
      {surface !== 'admin' && isHydrating ? (
        <Card role="status" className="p-4 text-sm text-zinc-300">Syncing your workspace…</Card>
      ) : null}
      {surface !== 'admin' && error ? (
        <Card role="alert" className="p-4 text-sm text-rose-300">Workspace sync failed: {error}</Card>
      ) : null}
      <PageTitle
        title={current.title}
        subtitle={current.description}
        action={
          <Button asChild variant="outline">
            <Link to="/mvp">Back to home</Link>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {content[surface]}

        <aside aria-label="Step guidance" className="self-start rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
          <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{copy.guidanceTitle}</CardTitle>

          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              {surface === 'admin' ? 'Current loop state' : 'Current step status'}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{activeSummary[surface]}</p>
          </div>

          <ul className="mt-5 divide-y divide-white/10">
            {copy.focus.map((item) => (
              <li key={item} className="py-3 text-sm leading-6 text-zinc-200 first:pt-0 last:pb-0">
                {item}
              </li>
            ))}
          </ul>

          {surface !== 'admin' ? (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs font-medium text-zinc-400">When this step is complete</p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{copy.outcome}</p>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {previous ? (
          <Button asChild variant="ghost" className="justify-between">
            <Link to={previous.path}>
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {previous.title}
              </span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {next ? (
          <Button asChild variant="ghost" className="justify-between">
            <Link to={next.path}>
              <span className="flex items-center gap-2">
                {next.title}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        ) : null}
      </section>
    </div>
  );
}
