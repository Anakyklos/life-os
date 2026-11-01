# LifeOS Weekly Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the proven weekly loop into one recognizable LifeOS shell, navigation system, and home without changing product contracts.

**Architecture:** `AppLayout` owns atmosphere and dock clearance. `NavigationSystem`, `Sidebar`, `Dock`, and `navItems` own one responsive partner-navigation contract. `MvpWorkspacePage` keeps the existing local `getNextStep` logic and changes presentation only.

**Tech Stack:** React 18, TypeScript, React Router, Tailwind CSS, installed Framer Motion, Vitest, Testing Library, Playwright.

## Global Constraints

- Implement ready issue #160 and the merged cockpit specification.
- No new dependency, route, state field, helper abstraction, global token, or legacy module.
- Keep backend, auth, store, schema, API, IPC, persistence, and admin untouched.
- Use scoped violet `#7357D9` with white foreground.
- Keep onboarding out of nav; incomplete onboarding keeps one CTA to `/mvp/onboarding`.
- Exactly one `aria-current="page"`; Home matches exact `/mvp` only.
- Home, Week, Today, Reflect, and Settings fit at 390px without horizontal scroll.
- Keep the shared route transition unchanged.

---

### Task 1: One partner navigation contract

**Files:**
- Create: `src/app/layout/NavigationSystem.test.tsx`
- Modify: `src/app/layout/navItems.ts`
- Modify: `src/app/layout/NavigationSystem.tsx`
- Modify: `src/app/layout/Sidebar.tsx`
- Modify: `src/shared/ui/premium/Dock.tsx`

**Interfaces:**
- Produces: `NavItem.end?: boolean`; `DockIcon.label?: string`; `DockIcon.active?: boolean`.
- Consumes: React Router pathname and the existing `useMediaQuery` breakpoint.

- [ ] **Step 1: Write the failing route-table test**

Create `NavigationSystem.test.tsx`:

```tsx
import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationSystem } from '@/app/layout/NavigationSystem';

vi.mock('@/shared/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));

it.each([
  ['/mvp', 'Home'],
  ['/mvp/weekly-review', 'Week'],
  ['/mvp/today', 'Today'],
  ['/mvp/reflection', 'Reflect'],
  ['/settings', 'Settings'],
] as const)('marks exactly one destination active on %s', (path, label) => {
  render(<MemoryRouter initialEntries={[path]}><NavigationSystem /></MemoryRouter>);
  const active = screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page');
  expect(active).toHaveLength(1);
  expect(active[0]).toHaveAccessibleName(label);
});

it('exposes only the five partner destinations', () => {
  render(<MemoryRouter initialEntries={['/mvp']}><NavigationSystem /></MemoryRouter>);
  expect(screen.getAllByRole('link')).toHaveLength(5);
  expect(screen.queryByRole('link', { name: /onboarding|admin|tasks|habits|finances/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Verify red**

Run `npm test -- src/app/layout/NavigationSystem.test.tsx`.

Expected: FAIL because current nav has only MVP and Settings and no mobile active metadata.

- [ ] **Step 3: Replace only the nav inventory**

In `navItems.ts` use installed Lucide icons and this exact structure:

```tsx
export const primaryNav: NavItem[] = [
  { label: 'Home', path: '/mvp', icon: Home, end: true },
  { label: 'Week', path: '/mvp/weekly-review', icon: CalendarRange },
  { label: 'Today', path: '/mvp/today', icon: ListChecks },
  { label: 'Reflect', path: '/mvp/reflection', icon: Sparkles },
];
export const secondaryNav: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: Settings },
];
export const mobileNav = [...primaryNav, ...secondaryNav];
```

Add `end?: boolean` to `NavItem`. Do not add onboarding or admin.

- [ ] **Step 4: Extend the existing Dock link instead of creating a component**

Add `label?: string` and `active?: boolean` to `DockIconProps`. Apply them to the existing `Link`:

```tsx
<Link
  to={href}
  aria-label={label}
  aria-current={active ? 'page' : undefined}
  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B87F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08070B]"
  onClick={onClick}
>
  {content}
</Link>
```

- [ ] **Step 5: Implement mobile and desktop active state**

In `NavigationSystem`, compare `pathname === item.path`, pass `label`, `active`, `magnification={48}`, and `distance={96}` to `DockIcon`, and use a compact no-scroll dock. In `Sidebar`, pass `end={item.end}`, remove admin filtering, keep accessible labels, and replace blue classes with scoped violet classes.

Required active class:

```tsx
'border border-[#7357D9]/35 bg-[#7357D9]/14 text-[#B7A7FF]'
```

Required mobile dock container:

```tsx
'max-w-[calc(100vw-1.5rem)] gap-1 border-white/10 bg-[#0D0C12]/92 px-2 py-2 backdrop-blur-xl'
```

- [ ] **Step 6: Verify green and commit**

Run:

```bash
npm test -- src/app/layout/NavigationSystem.test.tsx src/app/layout/AppLayout.test.tsx
npm run typecheck
```

Expected: PASS and exit 0. Commit the five Task 1 files with a Lore message explaining why partner navigation now follows the cycle.

---

### Task 2: Scoped LifeOS shell atmosphere

**Files:**
- Modify: `src/app/layout/AppLayout.test.tsx`
- Modify: `src/app/layout/AppLayout.tsx`

**Interfaces:**
- Preserves: `pb-32 md:pb-0`, route transition, Settings layout, and all global tokens.
- Produces: exactly one mounted `NavigationSystem`; that component remains the only responsive sidebar/dock owner.

- [ ] **Step 1: Add failing shell assertions**

```tsx
expect(screen.getByTestId('app-shell')).toHaveClass('bg-[#08070B]');
expect(screen.getByTestId('lifeos-atmosphere')).toBeInTheDocument();
expect(screen.getByTestId('route-content')).toHaveClass('pb-32', 'md:pb-0');
expect(screen.getAllByRole('navigation', { name: 'Navigation' })).toHaveLength(1);
```

- [ ] **Step 2: Verify red**

Run `npm test -- src/app/layout/AppLayout.test.tsx`.

Expected: FAIL because the shell evidence does not exist and the current layout mounts navigation twice.

- [ ] **Step 3: Apply the minimum atmosphere**

Add `data-testid="app-shell"` to the root and use:

```tsx
className="relative flex min-h-[100dvh] w-full flex-row overflow-x-hidden bg-[#08070B] font-display text-zinc-200 selection:bg-[#7357D9]/30"
```

Replace only the existing fixed atmosphere contents:

```tsx
<div data-testid="lifeos-atmosphere" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_-10%,rgba(115,87,217,0.16),transparent_38%),linear-gradient(180deg,#0D0C12_0%,#08070B_56%)]" />
  <div className="absolute inset-0 bg-noise opacity-[0.025] mix-blend-overlay" />
</div>
```

Delete the separate desktop and mobile `NavigationSystem` wrappers and mount it once:

```tsx
<NavigationSystem />
```

`NavigationSystem` already selects `Sidebar` or `Dock` from the shared 768px media query. Do not recreate that breakpoint in `AppLayout`. Remove the obsolete `mobile-navigation-slot` test assertion. Keep the `route-content` clearance assertion because the one mobile dock remains fixed.

Do not touch `src/index.css` or the shared motion transition.

- [ ] **Step 4: Verify and commit**

Run focused layout/navigation tests and `npm run typecheck`. Expected: PASS. Commit only `AppLayout.tsx` and its test.

---

### Task 3: One operational home hierarchy

**Files:**
- Modify: `src/features/mvp/__tests__/MvpWorkspacePage.test.tsx`
- Modify: `src/features/mvp/pages/MvpWorkspacePage.tsx`

**Interfaces:**
- Preserves: existing `loopSteps`, local `getNextStep`, selectors, hydration effect, retry, analytics truth, and route paths.

- [ ] **Step 1: Add failing hierarchy tests**

```tsx
it('renders one LifeOS action and one semantic cycle rail', async () => {
  renderWorkspace('executing');
  expect(await screen.findByRole('heading', { level: 1, name: 'Your week is active' })).toBeInTheDocument();
  expect(screen.getAllByTestId('primary-next-step')).toHaveLength(1);
  expect(screen.getByRole('list', { name: 'Weekly cycle' })).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  expect(screen.getByText('Today').closest('li')).toHaveAttribute('aria-current', 'step');
  expect(screen.queryByText(/MVP|surface|phase|readiness|build/i)).not.toBeInTheDocument();
});
```

Update the loading test to require `role="status"`, accessible name `Preparing your LifeOS workspace`, and no primary action.

- [ ] **Step 2: Verify red**

Run `npm test -- src/features/mvp/__tests__/MvpWorkspacePage.test.tsx`.

Expected: FAIL on heading, named cycle list, and loading status.

- [ ] **Step 3: Replace presentation, not state logic**

Use one `max-w-6xl` root, a single rounded-2xl operational hero, and one grouped rounded-2xl cycle rail. Make `nextStep.status` the only `h1`; keep `nextStep.title` and description subordinate. Use one primary button:

```tsx
<Button asChild size="lg" className="h-12 w-full justify-between bg-[#7357D9] px-5 text-white hover:bg-[#8068DF] active:scale-[0.98]">
  <Link to={nextStep.path} data-testid="primary-next-step">
    {nextStep.action}
    <ArrowRight className="h-4 w-4" aria-hidden="true" />
  </Link>
</Button>
```

Render the existing four steps in:

```tsx
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
```

Loading uses three skeleton blocks inside `role="status" aria-label="Preparing your LifeOS workspace"`, with `animate-pulse motion-reduce:animate-none`. Error uses the same root and one Retry button. Do not introduce a component or helper.

- [ ] **Step 4: Verify green, scan copy, and commit**

Run:

```bash
npm test -- src/features/mvp/__tests__/MvpWorkspacePage.test.tsx src/app/layout/NavigationSystem.test.tsx src/app/layout/AppLayout.test.tsx
rg -n "MVP|surface|phase|readiness|build" src/app/layout src/features/mvp/pages/MvpWorkspacePage.tsx
```

Expected: tests PASS; no visible shell/nav/home copy match. Commit the page and its test with a Lore message about making the next action dominant.

---

### Task 4: Verification and publication

**Evidence:**
- Before: `/tmp/lifeos-160-before/`
- After: `/tmp/lifeos-160-after/`
- Visual state: `.omx/state/lifeos-ux-160/ralph-progress.json` (never commit `.omx`).

- [ ] **Step 1: Capture before evidence before Task 1 edits**

With the synthetic local account and system Chrome, capture `/mvp`, `/mvp/weekly-review`, `/mvp/today`, `/mvp/reflection`, and `/settings` at 390x844 plus `/mvp` at 800x900 and 1440x1000. Record active links, primary CTA count, overflow, dock bounds, focus visibility, and reduced-motion state in `metrics.json`.

- [ ] **Step 2: Run full validation after Tasks 1-3**

```bash
LIFEOS_SESSION_SECRET=test-secret-for-ci npm test -- --reporter=json --outputFile=/tmp/lifeos-160-vitest.json
npm run typecheck
npm run lint
LIFEOS_OPERATING_MODE=local-dev npm run build
LIFEOS_OPERATING_MODE=local-dev npm run build:server
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome npm run test:e2e
git diff --check
```

Expected: zero failed tests, zero lint errors, both builds and canonical E2E pass.

- [ ] **Step 3: Capture after evidence and compare**

Repeat Step 1 into `/tmp/lifeos-160-after/`. Require exactly one active nav link, exact Home match, five controls fitting at 390px, no overflow/overlap, one loaded-home CTA, visible focus, and reduced-motion compliance.

- [ ] **Step 4: Run visual gates**

Run `visual-verdict` and save pass evidence. Separately score the seven-criterion LifeOS rubric at least 11/14, no critical zero, and clarity plus primary action at least 3/4.

TestSprite is skipped unless its installed cases directly assert this navigation/hierarchy contract; record why Playwright is the stronger test when it does not.

- [ ] **Step 5: Review and publish**

Run final code review, fix every Critical/Important finding, rerun affected checks, push `fix/160-lifeos-weekly-cockpit`, and open a draft PR linked to #160. Keep draft until CI/review pass, then follow the approved ready/merge workflow.

---

## Plan Self-Review

- Coverage: shell, navigation, exact active state, mobile fit, loaded/loading/error hierarchy, unchanged contracts, browser evidence, and visual gates are mapped.
- Scope: no route, state, backend, global token, dependency, or hidden module change.
- Type consistency: `NavItem.end`, `DockIcon.label`, and `DockIcon.active` are defined and consumed in Task 1.
- YAGNI: no new component, token layer, helper extraction, or design-system abstraction.
- Placeholder scan: no TBD, TODO, or undefined production function is required.
