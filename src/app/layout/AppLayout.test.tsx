import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppLayout } from '@/app/layout/AppLayout';

vi.mock('@/shared/lib/platform', () => ({
  isDesktopApp: () => false,
}));

vi.mock('@/features/onboarding/OnboardingModal', () => ({
  OnboardingModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Legacy onboarding overlay</div> : null,
}));

vi.mock('@/app/layout/NavigationSystem', () => ({
  NavigationSystem: () => <nav aria-label="Navigation">Navigation</nav>,
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
  expect(screen.getAllByRole('navigation', { name: 'Navigation' })).toHaveLength(1);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});
