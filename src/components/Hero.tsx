import React, { useState, useEffect } from 'react';
import { scrollToSectionById } from '../utils/scrollToSection';

const CV_PDF_BY_LANG = {
    es: '/pdf/CVJosephValderrama_ES.pdf',
    en: '/pdf/CVJosephValderrama_EN.pdf',
} as const;

const LG_MIN_WIDTH = '(min-width: 1024px)';

interface HeroProps {
    language: keyof typeof CV_PDF_BY_LANG;
    t: {
        greeting: string;
        name: string;
        staticSubtitle: string;
        subtitles: string[];
        description: string;
        resumeButton: string;
        contactButton: string;
    }
}

const Hero: React.FC<HeroProps> = ({ language, t }) => {
    const [isLgUp, setIsLgUp] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(LG_MIN_WIDTH).matches,
    );
    const [subtitleIndex, setSubtitleIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(LG_MIN_WIDTH);
        const onChange = () => setIsLgUp(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        setDisplayedText('');
        setIsDeleting(false);
        setSubtitleIndex(0);
    }, [t]);

    useEffect(() => {
        if (!isLgUp) return;

        const handleTyping = () => {
            const currentSubtitle = t.subtitles[subtitleIndex];

            if (isDeleting) {
                if (displayedText.length > 0) {
                    setDisplayedText(currentSubtitle.substring(0, displayedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setSubtitleIndex((prevIndex) => (prevIndex + 1) % t.subtitles.length);
                }
            } else {
                if (displayedText.length < currentSubtitle.length) {
                    setDisplayedText(currentSubtitle.substring(0, displayedText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            }
        };

        const typingSpeed = isDeleting ? 75 : 120;
        const timeout = setTimeout(handleTyping, typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, subtitleIndex, t, isLgUp]);
    
    const handleScrollToContact = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        window.history.replaceState(null, '', '#contacto');
        scrollToSectionById('contacto', 'smooth');
    };

    return (
        <section id="home" className="scroll-mt-24 min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24 flex items-center min-h-[calc(100vh-80px)] py-20">
                <div className="w-full grid lg:grid-cols-2 gap-10 items-center">
                    <div className="animate-fade-in-up">
                        <p className="text-accent text-lg font-medium mb-2">{t.greeting}</p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary leading-tight">
                            {t.name} <span className="text-accent">Joseph Valderrama</span>.
                        </h1>
                        <h2
                            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-text-secondary mt-2 leading-snug ${
                                isLgUp ? 'min-h-[5lh] sm:min-h-[4lh] md:min-h-[3lh]' : ''
                            }`}
                            aria-live={isLgUp ? 'polite' : undefined}
                        >
                            {isLgUp ? (
                                <>
                                    {displayedText}
                                    <span className="animate-blink" aria-hidden>
                                        |
                                    </span>
                                </>
                            ) : (
                                t.staticSubtitle
                            )}
                        </h2>
                        <p className="text-text-secondary mt-4 max-w-xl">
                            {t.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                            <a
                                href={CV_PDF_BY_LANG[language]}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="bg-accent text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105"
                            >
                                {t.resumeButton}
                            </a>
                            <a 
                                href="#contacto" 
                                onClick={handleScrollToContact}
                                className="bg-transparent border-2 border-text-muted text-text-secondary font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-500/20 hover:border-text-secondary transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                {t.contactButton}
                            </a>
                        </div>
                    </div>
                    <div className="hidden lg:flex justify-center items-center animate-fade-in">
                        <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-card-background border-2 border-border shadow-2xl overflow-hidden">
                            <img
                                src="/img/profile.jpeg"
                                alt="Joseph Valderrama"
                                className="w-full h-full object-cover transform"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;