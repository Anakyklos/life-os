import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function systemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeState {
    theme: 'light' | 'dark'
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: systemTheme(),
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'life-os-theme',
        }
    )
)
