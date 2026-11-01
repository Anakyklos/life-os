import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Circle } from 'lucide-react';

import { useMvpStore } from '@/features/mvp/store/useMvpStore';
import type { MvpAnalyticsSnapshot, MvpOnboardingDraft, MvpPlan } from '@/features/mvp/types';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

const loopSteps = ['Onboarding', 'Weekly review', 'Today', 'Reflection'] as const;

function getNextStep(
  onboarding: MvpOnboardingDraft,
  plan: MvpPlan,
  analytics: MvpAnalyticsSnapshot
) {
  if (!onboarding.completedAt) {
    return {
      stepIndex: 0,
      status: 'Set your foundation',
      title: 'Start with what this week needs',
      description: 'Capture your goals, commitments, and constraints once so the plan can stay realistic.',
      action: 'Start with your context',
      path: '/mvp/onboarding',
    };
  }

  if (!plan.generatedAt) {
    return {
      stepIndex: 1,
      status: 'Shape the week',
      title: 'Turn your context into a focused plan',
      description: 'Review what is unfinished, name the main focus, and create a small set of priorities.',
      action: 'Plan your week',
      path: '/mvp/weekly-review',
    };
  }

  if (!plan.confirmedAt) {
    return {
      stepIndex: 1,
      status: 'Your plan is ready',
      title: 'Make sure the week feels achievable',
      description: 'Review the suggested priorities and confirm them before daily execution begins.',
      action: 'Review your weekly plan',
      path: '/mvp/weekly-review',
    };
  }

  if (analytics.totalActions > 0 && analytics.completedActions >= analytics.totalActions) {
    return {
      stepIndex: 3,
      status: 'Close the loop',
      title: 'Notice what worked before moving on',
      description: 'Capture the useful signal from this week so the next plan starts with better context.',
      action: 'Reflect on your week',
      path: '/mvp/reflection',
    };
  }

  return {
    stepIndex: 2,
    status: 'Your week is active',
    title: 'Keep today deliberately small',
    description: 'Work from the confirmed priorities, update the next action, and record any blocker.',
    action: 'Continue with today',
    path: '/mvp/today',
  };
}

export function MvpWorkspacePage() {
  const [initialHydrationComplete, setInitialHydrationComplete] = useState(false);
  const onboarding = useMvpStore((state) => state.onboarding);
  const plan = useMvpStore((state) => state.plan);
  const analytics = useMvpStore((state) => state.analytics);
  const isHydrating = useMvpStore((state) => state.isHydrating);
  const error = useMvpStore((state) => state.error);
  const hydrateWorkspace = useMvpStore((state) => state.hydrateWorkspace);
  const nextStep = getNextStep(onboarding, plan, analytics);

  useEffect(() => {
    let active = true;
    void Promise.resolve(hydrateWorkspace()).finally(() => {
      if (active) setInitialHydrationComplete(true);
    });

    return () => {
      active = false;
    };
  }, [hydrateWorkspace]);

  if (!initialHydrationComplete || isHydrating) {
    return (
      <main className="mx-auto w-full max-w-6xl">
        <Card
          role="status"
          aria-label="Preparing your LifeOS workspace"
          className="space-y-6 rounded-2xl border-white/10 bg-[#0D0C12]/72 p-6 sm:p-8"
        >
          <div className="h-8 w-2/5 animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none" />
          <div className="h-20 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
          <div className="h-24 animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl">
        <Card className="space-y-4 rounded-2xl border-white/10 bg-[#0D0C12]/72 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Your weekly workspace could not be loaded.</h1>
          <p className="text-sm leading-6 text-zinc-400">Check the connection and try again. Your saved workspace has not been changed.</p>
          <Button onClick={() => void hydrateWorkspace(true)}>Try again</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 md:pb-8">
      <Card className="grid gap-8 rounded-2xl border-white/10 bg-[#0D0C12]/72 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{nextStep.status}</h1>
          <h2 className="mt-3 text-xl font-medium tracking-tight text-zinc-200 sm:text-2xl">{nextStep.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">{nextStep.description}</p>
          {analytics.totalActions > 0 ? (
            <p className="mt-5 text-sm tabular-nums text-zinc-400">
              {analytics.completedActions} of {analytics.totalActions} actions complete
            </p>
          ) : null}
        </div>

        <Button asChild size="lg" className="h-12 w-full justify-between bg-[#7357D9] px-5 text-white hover:bg-[#8068DF] active:scale-[0.98]">
          <Link to={nextStep.path} data-testid="primary-next-step">
            {nextStep.action}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </Card>

      <section aria-label="This week">
        <ol aria-label="Weekly cycle" className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#0D0C12]/72 sm:grid-cols-4 sm:divide-x sm:divide-white/10">
          {loopSteps.map((step, index) => {
            const complete = index < nextStep.stepIndex;
            const current = index === nextStep.stepIndex;

            return (
              <li
                key={step}
                aria-current={current ? 'step' : undefined}
                className={`flex min-h-24 items-center gap-3 border-b border-white/10 px-5 py-4 last:border-b-0 sm:border-b-0 ${
                  current ? 'bg-[#7357D9]/12 text-[#F3F0FA]' : complete ? 'text-zinc-300' : 'text-zinc-600'
                }`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current/30">
                  {complete ? <Check className="size-4" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
