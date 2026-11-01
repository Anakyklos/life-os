import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { primaryNav, secondaryNav } from './navItems';
import { LanguageSelector } from '@/shared/components/LanguageSelector';

export const Sidebar = ({ className }: { className?: string }) => {
    return (
        <aside className={cn("flex flex-col items-center py-8 w-24 h-full shrink-0 border-r border-white/10 bg-white/5 dark:bg-zinc-900/20 backdrop-blur-2xl shadow-xl z-50", className)}>
            <div className="mb-8 shrink-0 flex flex-col items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border border-white/10 shadow-lg hover:border-primary/40 transition-colors group cursor-pointer">
                    <span className="text-white/80 font-bold text-sm tracking-widest group-hover:text-white transition-colors">OS</span>
                </div>
            </div>

            <nav aria-label="Navigation" className="flex flex-col gap-6 w-full px-4 flex-1 overflow-y-auto no-scrollbar items-center">
                {primaryNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        aria-label={item.label}
                        className={({ isActive }) => cn(
                            "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 w-full aspect-square",
                            isActive
                                ? "border border-[#7357D9]/35 bg-[#7357D9]/14 text-[#B7A7FF]"
                                : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive ? "text-[#B7A7FF]" : "text-zinc-500 group-hover:text-white")} strokeWidth={1.5} />

                                {/* Tooltip */}
                                <span className="absolute left-full ml-4 bg-zinc-900/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] uppercase tracking-wider text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto flex flex-col gap-6 w-full px-4 shrink-0 items-center">
                {secondaryNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        aria-label={item.label}
                        className={({ isActive }) => cn(
                            "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 w-full aspect-square",
                            isActive
                                ? "border border-[#7357D9]/35 bg-[#7357D9]/14 text-[#B7A7FF]"
                                : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive ? "text-[#B7A7FF]" : "text-zinc-500 group-hover:text-white")} strokeWidth={1.5} />
                                <span className="absolute left-full ml-4 bg-zinc-900/90 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] uppercase tracking-wider text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 translate-x-[-10px] group-hover:translate-x-0 duration-200">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}

                <LanguageSelector className="hidden xl:block" />
            </div>
        </aside>
    );
};
