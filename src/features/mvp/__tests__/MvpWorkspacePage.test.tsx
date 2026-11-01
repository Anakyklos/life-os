import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { MvpWorkspacePage } from '@/features/mvp/pages/MvpWorkspacePage';
import { createEmptyWorkspace, withComputedAnalytics } from '@/features/mvp/lib/state';
import { useMvpStore } from '@/features/mvp/store/useMvpStore';
import type { MvpWorkspaceSnapshot } from '@/features/mvp/types';

function workspaceAt(state: 'onboarding' | 'planning' | 'confirming' | 'executing' | 'reflecting') {
  const empty = createEmptyWorkspace();
  const workspace: Omit<MvpWorkspaceSnapshot, 'analytics'> = {
    ...empty,
    onboarding: {
      ...empty.onboarding,
      completedAt: state === 'onboarding' ? null : '2026-07-18T12:00:00.000Z',
    },
    plan: {
      ...empty.plan,
      id: state === 'onboarding' || state === 'planning' ? undefined : 'plan-1',
      generatedAt: state === 'onboarding' || state === 'planning' ? null : '2026-07-18T12:10:00.000Z',
      confirmedAt: state === 'executing' || state === 'reflecting' ? '2026-07-18T12:20:00.000Z' : null,
      priorities: state === 'onboarding' || state === 'planning' ? [] : [{
        id: 'priority-1',
        title: 'Protect the weekly focus',
        rationale: 'Keep the plan narrow.',
        successMetric: 'One clear outcome',
        actions: [{
          id: 'action-1',
          title: 'Complete the next action',
          details: '',
          note: '',
          status: state === 'reflecting' ? 'done' : 'todo',
        }],
      }],
    },
  };

  return withComputedAnalytics(workspace);
}

function renderWorkspace(state: Parameters<typeof workspaceAt>[0]) {
  useMvpStore.setState({
    ...workspaceAt(state),
    isHydrating: false,
    error: null,
    hydrateWorkspace: vi.fn(),
  });

  return render(
    <MemoryRouter>
      <MvpWorkspacePage />
    </MemoryRouter>
  );
}

describe('MVP workspace next step', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    ['onboarding', 'Start with your context', '/mvp/onboarding'],
    ['planning', 'Plan your week', '/mvp/weekly-review'],
    ['confirming', 'Review your weekly plan', '/mvp/weekly-review'],
    ['executing', 'Continue with today', '/mvp/today'],
    ['reflecting', 'Reflect on your week', '/mvp/reflection'],
  ] as const)('routes %s state to one primary next step', async (state, label, path) => {
    renderWorkspace(state);

    const primaryAction = await screen.findByRole('link', { name: label });
    expect(primaryAction).toHaveAttribute('href', path);
    expect(screen.getAllByTestId('primary-next-step')).toHaveLength(1);
  });

  it('renders one LifeOS action and one semantic cycle rail', async () => {
    renderWorkspace('executing');

    expect(await screen.findByRole('heading', { level: 1, name: 'Your week is active' })).toBeInTheDocument();
    expect(screen.getAllByTestId('primary-next-step')).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Weekly cycle' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Today').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.queryByText(/MVP|surface|phase|readiness|build/i)).not.toBeInTheDocument();
  });

  it('does not expose a stale next step before hydration starts', () => {
    useMvpStore.setState({
      ...workspaceAt('onboarding'),
      isHydrating: false,
      error: null,
      hydrateWorkspace: vi.fn(() => new Promise<void>(() => undefined)),
    });

    render(
      <MemoryRouter>
        <MvpWorkspacePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: 'Preparing your LifeOS workspace' })).toBeInTheDocument();
    expect(screen.queryByTestId('primary-next-step')).not.toBeInTheDocument();
  });

  it('keeps implementation details and internal admin out of the partner home', async () => {
    renderWorkspace('onboarding');

    await screen.findByRole('link', { name: 'Start with your context' });

    expect(screen.queryByText(/MVP Surfaces|Foundation Checklist|Prisma|backend|telemetry|Immediate next work/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Analytics')).not.toBeInTheDocument();
  });
});
