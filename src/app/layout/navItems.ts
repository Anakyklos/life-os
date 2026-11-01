import type { LucideIcon } from 'lucide-react';
import {
  CalendarRange,
  Home,
  ListChecks,
  Settings,
  Sparkles,
} from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
};

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
