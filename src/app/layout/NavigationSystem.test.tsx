import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavigationSystem } from '@/app/layout/NavigationSystem';

const mediaQuery = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: () => mediaQuery.isDesktop,
}));

const destinations = [
  ['/mvp', 'Home'],
  ['/mvp/weekly-review', 'Week'],
  ['/mvp/today', 'Today'],
  ['/mvp/reflection', 'Reflect'],
  ['/settings', 'Settings'],
] as const;

function renderNavigation(path: string, isDesktop: boolean) {
  mediaQuery.isDesktop = isDesktop;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavigationSystem />
    </MemoryRouter>,
  );
}

it.each([false, true])('exposes one named navigation landmark in %s mode', (isDesktop) => {
  renderNavigation('/mvp', isDesktop);
  expect(screen.getAllByRole('navigation', { name: 'Navigation' })).toHaveLength(1);
});

it.each([false, true])('marks exactly one destination active for every route in %s mode', (isDesktop) => {
  for (const [path, label] of destinations) {
    const { unmount } = renderNavigation(path, isDesktop);
    const active = screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAccessibleName(label);
    unmount();
  }
});

it.each([false, true])('keeps Home exact-only in %s mode', (isDesktop) => {
  renderNavigation('/mvp/today', isDesktop);
  expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});

it('shows a persistent active treatment on mobile without removing focus visibility', () => {
  renderNavigation('/mvp/today', false);
  const active = screen.getByRole('link', { name: 'Today' });
  expect(active).toHaveClass('border', 'border-[#7357D9]/35', 'bg-[#7357D9]/14', 'text-[#B7A7FF]');
  expect(active).toHaveClass('focus-visible:ring-2');
  expect(screen.getByRole('link', { name: 'Week' })).toHaveClass('text-zinc-500', 'border-transparent');
});

it.each([false, true])('exposes only the five partner destinations in %s mode', (isDesktop) => {
  renderNavigation('/mvp', isDesktop);
  expect(screen.getAllByRole('link')).toHaveLength(5);
  expect(screen.queryByRole('link', { name: /onboarding|admin|tasks|habits|finances/i })).not.toBeInTheDocument();
});
