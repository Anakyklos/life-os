import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { NavigationSystem } from './NavigationSystem';
import { OnboardingModal } from '@/features/onboarding/OnboardingModal';
import { isDesktopApp } from '@/shared/lib/platform';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// FÍSICA ATMOSFÉRICA & TRANSIÇÕES
const pageVariants = {
    initial: { opacity: 0, scale: 0.99, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.01, filter: "blur(4px)" }
};

const pageTransition: Transition = {
    type: "tween",
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.4
};

export function AppLayout() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const location = useLocation();
    const desktopApp = isDesktopApp();

    useEffect(() => {
        if (desktopApp && !localStorage.getItem('life-os-onboarding-completed')) {
            setShowOnboarding(true);
        }
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, [desktopApp]);

    return (
        <div
            data-testid="app-shell"
            className="relative flex min-h-[100dvh] w-full flex-row overflow-x-hidden bg-[#08070B] font-display text-zinc-200 selection:bg-[#7357D9]/30"
        >
            <ScrollToTop />

            {/* ATMOSPHERE LAYER - Fixed Background Elements */}
            <div data-testid="lifeos-atmosphere" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_-10%,rgba(115,87,217,0.16),transparent_38%),linear-gradient(180deg,#0D0C12_0%,#08070B_56%)]" />
                <div className="absolute inset-0 bg-noise opacity-[0.025] mix-blend-overlay" />
            </div>



            {desktopApp ? (
                <OnboardingModal isOpen={showOnboarding} onClose={() => {
                    localStorage.setItem('life-os-onboarding-completed', 'true');
                    setShowOnboarding(false);
                }} />
            ) : null}

            <NavigationSystem />

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-y-auto relative z-10 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                        data-testid="route-content"
                        className="w-full min-h-screen pb-32 md:pb-0"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

        </div>
    );
}
