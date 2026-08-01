export const cockpitTheme = {
  shellBase: 'bg-[#08070B] selection:bg-[#7357D9]/30',
  atmosphere:
    'bg-[radial-gradient(circle_at_72%_-10%,rgba(115,87,217,0.16),transparent_38%),linear-gradient(180deg,#0D0C12_0%,#08070B_56%)]',
  surfacePanel: 'border-white/10 bg-[#0D0C12]/72',
  surfaceDock: 'border-white/10 bg-[#0D0C12]/92',
  primaryAction: 'bg-[#7357D9] hover:bg-[#8068DF]',
  railActive: 'bg-[#7357D9]/12 text-[#F3F0FA]',
  activeNav: 'border border-[#7357D9]/35 bg-[#7357D9]/14 text-[#B7A7FF]',
  accentText: 'text-[#B7A7FF]',
  focusRing: 'focus-visible:ring-[#9B87F5] focus-visible:ring-offset-[#08070B]',
} as const;
