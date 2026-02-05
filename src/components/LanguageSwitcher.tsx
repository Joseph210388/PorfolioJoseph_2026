import React from 'react';
import { SpainFlagIcon, UsaFlagIcon } from './icons';

interface LanguageSwitcherProps {
    language: 'es' | 'en';
    setLanguage: (lang: 'es' | 'en') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
    const toggleLanguage = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="p-3 rounded-full bg-card-background/50 backdrop-blur-sm text-text-secondary hover:text-accent shadow-lg border border-border transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
            {language === 'es' ? (
                <UsaFlagIcon className="w-8 h-8 rounded-full" />
            ) : (
                <SpainFlagIcon className="w-8 h-8 rounded-full" />
            )}
        </button>
    );
};

export default LanguageSwitcher;
