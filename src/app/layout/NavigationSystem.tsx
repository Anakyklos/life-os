import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { Dock, DockIcon } from '@/shared/ui/premium/Dock';
import { mobileNav } from './navItems';

type NavigationSystemProps = {
    isSanctuaryActive?: boolean;
};

export function NavigationSystem({ isSanctuaryActive = false }: NavigationSystemProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const { pathname } = useLocation();

    const slideProps = {
        animate: { x: isSanctuaryActive ? '-100%' : '0%' },
        transition: { ease: 'easeInOut' as const, duration: 0.3 },
        style: { transformStyle: 'preserve-3d' as const }
    };

    if (isDesktop) {
        return (
            <motion.div {...slideProps}>
                <Sidebar className="sticky top-0 h-screen border-r border-white/10" />
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-x-0 z-40 md:hidden flex justify-center pointer-events-none" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <motion.div
                {...slideProps}
                className="w-auto max-w-[92vw] pointer-events-auto"
            >
                <nav aria-label="Navigation">
                    <Dock
                        magnification={48}
                        distance={96}
                        className="max-w-[calc(100vw-1.5rem)] gap-1 border-white/10 bg-[#0D0C12]/92 px-2 py-2 backdrop-blur-xl"
                    >
                        {mobileNav.map((item) => {
                            const active = pathname === item.path;

                            return (
                                <DockIcon
                                    key={item.path}
                                    href={item.path}
                                    label={item.label}
                                    active={active}
                                    magnification={48}
                                    distance={96}
                                >
                                    <item.icon className={active ? "size-6 text-[#B7A7FF]" : "size-6 text-zinc-300"} />
                                </DockIcon>
                            );
                        })}
                    </Dock>
                </nav>
            </motion.div>
        </div>
    );
}
