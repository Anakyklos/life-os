import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppLayout } from '@/app/layout/AppLayout';
import i18n from '@/shared/i18n';

vi.mock('@/shared/lib/platform', () => ({
  isDesktopApp: () => false,
}));

vi.mock('@/features/onboarding/OnboardingModal', () => ({
  OnboardingModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Legacy onboarding overlay</div> : null,
}));

vi.mock('@/app/layout/NavigationSystem', () => ({
  NavigationSystem: () => <nav aria-label="Primary">Navigation</nav>,
}));

beforeEach(() => {
  window.scrollTo = vi.fn();
});

it('does not mount the legacy onboarding over the canonical web loop', async () => {
  localStorage.removeItem('life-os-onboarding-completed');

  render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  );

  expect(screen.queryByText('Legacy onboarding overlay')).not.toBeInTheDocument();
});

it('reserves mobile content clearance without a second fixed navigation wrapper', () => {
  render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  );

  expect(screen.getByTestId('app-shell')).toHaveClass('bg-[#08070B]');
  expect(screen.getByTestId('lifeos-atmosphere')).toBeInTheDocument();
  expect(screen.getByTestId('route-content')).toHaveClass(
    'pb-32',
    'md:pb-0'
  );
  expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(1);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

it('provides a skip link that targets the main landmark', () => {
  render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  );

  const skip = screen.getByRole('link', { name: 'Skip to content' });
  expect(skip).toHaveAttribute('href', '#main-content');

  const main = screen.getByRole('main');
  expect(main).toHaveAttribute('id', 'main-content');
  expect(main).toHaveAttribute('tabindex', '-1');
});

it('does not force a dark class and syncs html lang to the active language', () => {
  render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  );

  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(document.documentElement.lang).toBe(i18n.resolvedLanguage ?? i18n.language ?? 'en');
});
