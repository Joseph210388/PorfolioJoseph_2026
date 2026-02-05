import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
    theme: string;
    toggleTheme: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-card-background/50 backdrop-blur-sm text-text-secondary hover:text-accent shadow-lg border border-border transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-8 h-8" />
            ) : (
                <SunIcon className="w-8 h-8" />
            )}
        </button>
    );
};

export default ThemeSwitcher;
