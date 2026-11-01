import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { MvpSurfacePage } from '@/features/mvp/pages/MvpSurfacePage';
import { useMvpStore } from '@/features/mvp/store/useMvpStore';
import { createEmptyWorkspace } from '@/features/mvp/lib/state';

function renderSurface(surface: Parameters<typeof MvpSurfacePage>[0]['surface']) {
  return render(
    <MemoryRouter>
      <MvpSurfacePage surface={surface} />
    </MemoryRouter>
  );
}

describe('MVP loop integration', () => {
  beforeEach(() => {
    localStorage.clear();
    window.gtag = vi.fn() as typeof window.gtag;
    useMvpStore.setState({ ...createEmptyWorkspace(), isHydrating: false, error: null });
  });

  it('moves through the MVP loop without external telemetry', { timeout: 15000 }, async () => {
    const user = userEvent.setup({ delay: null });

    const onboardingView = renderSurface('onboarding');

    await user.type(screen.getByPlaceholderText('Display name'), 'Pedro');
    await user.type(screen.getByPlaceholderText('Role'), 'Founder');
    await user.type(screen.getByPlaceholderText('Life season'), 'Building the first design-partner loop');
    await user.type(screen.getByPlaceholderText('Success definition for this season'), 'Turn intent into a clear week.');
    await user.type(screen.getByPlaceholderText('Goals, one per line'), 'Ship MVP\nRun design partner');
    await user.type(screen.getByPlaceholderText('Recurring commitments, one per line'), 'Family logistics');
    await user.type(screen.getByPlaceholderText('Constraints or realities, one per line'), 'School pickup twice a week');
    await user.click(screen.getByRole('button', { name: 'Save intake' }));

    await waitFor(() => {
      expect(useMvpStore.getState().onboarding.completedAt).toBeTruthy();
    });
    onboardingView.unmount();

    const weeklyReviewView = renderSurface('weekly-review');

    await user.type(screen.getByPlaceholderText('Primary focus area'), 'Activation');
    await user.clear(screen.getByPlaceholderText('Energy level 1-5'));
    await user.type(screen.getByPlaceholderText('Energy level 1-5'), '4');
    await user.type(screen.getByPlaceholderText('Unfinished work still pulling attention, one per line'), 'Confirm landing page copy');
    await user.type(screen.getByPlaceholderText('Notes that should shape the plan'), 'Keep the week narrow.');
    await user.click(screen.getByRole('button', { name: 'Generate weekly plan' }));

    expect(await screen.findByText('Generated weekly plan')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm weekly plan' }));
    await waitFor(() => {
      expect(useMvpStore.getState().plan.confirmedAt).toBeTruthy();
    });
    weeklyReviewView.unmount();

    renderSurface('today');

    expect(await screen.findByText('Daily execution board')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Complete' })[0]);

    await user.clear(screen.getByPlaceholderText('Execution note'));
    await user.type(screen.getByPlaceholderText('Execution note'), 'Focused block booked for the first action.');
    await user.click(screen.getByRole('button', { name: 'Save daily check-in' }));

    await waitFor(() => {
      const analytics = useMvpStore.getState().getAnalytics();
      expect(analytics.completedActions).toBe(1);
      expect(analytics.dailyCheckIns).toBe(1);
    });

    const todayView = screen.getByText('Daily execution board');
    expect(todayView).toBeInTheDocument();

    renderSurface('reflection');

    await user.type(screen.getByPlaceholderText('Daily reflection'), 'The daily loop stayed clear.');
    await user.click(screen.getByRole('button', { name: 'Save daily reflection' }));
    await user.type(screen.getByPlaceholderText('What created clarity or friction?'), 'Weekly plan confirmation made execution obvious.');
    await user.click(screen.getByRole('button', { name: 'Submit feedback' }));
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('ends partner sequencing at reflection instead of linking to Admin', () => {
    renderSurface('reflection');

    expect(screen.queryByRole('link', { name: /Admin Analytics/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Today/i })).toHaveAttribute('href', '/mvp/today');
  });

  it.each([
    ['onboarding', 'Build your starting context', /Saving this opens Weekly Review/i],
    ['weekly-review', 'Shape a realistic week', /Confirming the plan opens Today/i],
    ['today', "Work from today's next actions", /Completing the work makes Reflection/i],
    ['reflection', 'Close the loop', /Your reflections become context for the next Weekly Review/i],
  ] as const)('keeps %s guidance user-facing', (surface, heading, outcome) => {
    renderSurface(surface);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByText(outcome)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/mvp');
    expect(screen.getByText('Current step status')).toBeInTheDocument();
    expect(screen.queryByText('Current loop state')).not.toBeInTheDocument();
    expect(screen.queryByText(/Next build steps|Phase \d|placeholder|analytics|persist|deterministic AI|cohort|backend|MVP/i)).not.toBeInTheDocument();
  });

  it.each([
    ['onboarding', [
      ['textbox', 'Display name'],
      ['textbox', 'What is breaking in the current planning system?'],
      ['textbox', 'Goals'],
    ]],
    ['weekly-review', [
      ['textbox', 'Primary focus area'],
      ['spinbutton', 'Energy level'],
      ['textbox', 'Wins from the previous cycle'],
    ]],
    ['reflection', [
      ['textbox', 'Daily reflection'],
      ['spinbutton', 'Rating'],
      ['textbox', 'What created clarity or friction?'],
    ]],
  ] as const)('gives %s inputs accessible names', (surface, fields) => {
    renderSurface(surface);

    for (const [role, name] of fields) {
      expect(screen.getByRole(role, { name })).toBeInTheDocument();
    }
  });

  it('labels today inputs once the week is confirmed', () => {
    const workspace = createEmptyWorkspace();
    useMvpStore.setState({
      ...workspace,
      plan: {
        ...workspace.plan,
        id: 'plan-1',
        generatedAt: '2026-07-18T12:10:00.000Z',
        confirmedAt: '2026-07-18T12:20:00.000Z',
        priorities: [{
          id: 'priority-1',
          title: 'Protect the weekly focus',
          rationale: 'Keep the plan narrow.',
          successMetric: 'One clear outcome',
          actions: [{ id: 'action-1', title: 'Complete the next action', details: '', note: '', status: 'todo' }],
        }],
      },
    });
    renderSurface('today');

    expect(screen.getByRole('spinbutton', { name: 'Energy level today' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Blockers' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Execution note' })).toBeInTheDocument();
  });

  it('renders guidance as a distinct panel instead of an equal card', () => {
    renderSurface('onboarding');

    expect(screen.getByRole('complementary', { name: 'Step guidance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Build your starting context' })).toBeInTheDocument();
  });

  it('keeps exactly one primary action per surface', () => {
    const primaryButtons = () =>
      screen.getAllByRole('button').filter((button) => button.className.includes('bg-primary-cta'));

    const emptyOnboarding = renderSurface('onboarding');
    expect(primaryButtons()).toHaveLength(1);
    emptyOnboarding.unmount();

    const emptyReview = renderSurface('weekly-review');
    expect(primaryButtons()).toHaveLength(1);
    emptyReview.unmount();

    const reflectionView = renderSurface('reflection');
    expect(primaryButtons()).toHaveLength(1);
    reflectionView.unmount();

    useMvpStore.setState({
      ...createEmptyWorkspace(),
      plan: {
        ...createEmptyWorkspace().plan,
        generatedAt: '2026-07-18T12:10:00.000Z',
        confirmedAt: '2026-07-18T12:20:00.000Z',
        priorities: [{
          id: 'priority-1',
          title: 'Protect the weekly focus',
          rationale: 'Keep the plan narrow.',
          successMetric: 'One clear outcome',
          actions: [{ id: 'action-1', title: 'Complete the next action', details: '', note: '', status: 'todo' }],
        }],
      },
    });
    const todayView = renderSurface('today');
    expect(primaryButtons()).toHaveLength(1);
    expect(primaryButtons()[0]).toHaveAccessibleName('Save daily check-in');
    todayView.unmount();

    useMvpStore.setState({
      ...createEmptyWorkspace(),
      plan: { ...createEmptyWorkspace().plan, generatedAt: '2026-07-18T12:10:00.000Z' },
    });
    const generatedReview = renderSurface('weekly-review');
    expect(primaryButtons()).toHaveLength(1);
    expect(primaryButtons()[0]).toHaveAccessibleName('Confirm weekly plan');
    expect(screen.getByRole('button', { name: 'Generate weekly plan' })).not.toHaveClass('bg-primary-cta');
    generatedReview.unmount();
  });

  it('announces workspace sync errors through an alert region', () => {
    useMvpStore.setState({ error: 'Connection lost', hydrateWorkspace: vi.fn() });
    renderSurface('onboarding');

    expect(screen.getByRole('alert')).toHaveTextContent('Workspace sync failed: Connection lost');
  });
});
