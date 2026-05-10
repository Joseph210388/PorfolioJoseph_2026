import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SocialLinks from './components/SocialLinks';
import Section from './components/Section';
import LoadingScreen from './components/LoadingScreen';
import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';
import { translations } from './i18n/translations';
import { scrollToSectionById } from './utils/scrollToSection';
import {
    internalPathToSectionId,
    isKnownSectionHash,
    normalizeAppPath,
    normalizeUnknownPathToHome,
    pathnameWithoutBase,
    sectionIdToPath,
    toBrowserPath,
} from './utils/sectionRoutes';
import { AboutContent } from './sections/AboutSection';
import { ProjectsContent } from './sections/ProjectsSection';
import { ExperienceTabs } from './sections/ExperienceSection';
import { ContactContent } from './sections/ContactSection';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme || (userPrefersDark ? 'dark' : 'light');
    });

    const [language, setLanguage] = useState<'es' | 'en'>(() => {
        const savedLang = localStorage.getItem('language');
        return savedLang === 'en' || savedLang === 'es' ? savedLang : 'es';
    });

    const t = translations[language];

    const blob1Ref = useRef<HTMLDivElement>(null);
    const blob2Ref = useRef<HTMLDivElement>(null);
    const blob3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return;
        const hash = window.location.hash.replace(/^#/, '');
        if (hash && isKnownSectionHash(hash)) {
            const path = sectionIdToPath(hash);
            window.history.replaceState(null, '', toBrowserPath(path));
            requestAnimationFrame(() => {
                scrollToSectionById(hash, 'auto');
            });
            return;
        }
        const raw = normalizeAppPath(pathnameWithoutBase(window.location.pathname));
        const internal = normalizeUnknownPathToHome(window.location.pathname);
        if (internal !== raw) {
            window.history.replaceState(null, '', toBrowserPath(internal));
        }
        const id = internalPathToSectionId(internal);
        requestAnimationFrame(() => {
            scrollToSectionById(id, 'auto');
        });
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) return;
        const onPopState = () => {
            const raw = normalizeAppPath(pathnameWithoutBase(window.location.pathname));
            const internal = normalizeUnknownPathToHome(window.location.pathname);
            if (internal !== raw) {
                window.history.replaceState(null, '', toBrowserPath(internal));
            }
            scrollToSectionById(internalPathToSectionId(internal), 'auto');
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [isLoading]);

    useEffect(() => {
        let animationFrameId: number;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (blob1Ref.current) {
                    blob1Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`;
                }
                if (blob2Ref.current) {
                    blob2Ref.current.style.transform = `translateY(${scrollY * -0.1}px)`;
                }
                if (blob3Ref.current) {
                    blob3Ref.current.style.transform = `translateY(${scrollY * 0.15}px)`;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
                <div ref={blob1Ref} className="absolute top-0 -left-4">
                    <div className="w-72 h-72 bg-[var(--color-blob-1)] rounded-full filter blur-3xl opacity-50 animate-blob"></div>
                </div>
                <div ref={blob2Ref} className="absolute top-0 -right-4">
                    <div className="w-72 h-72 bg-[var(--color-blob-2)] rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                </div>
                <div ref={blob3Ref} className="absolute bottom-0 left-20 translate-y-1/4">
                    <div className="w-72 h-72 bg-[var(--color-blob-3)] rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
                </div>
            </div>

            <div className="relative z-10 min-h-screen bg-background">
                <Header t={t.header} />
                <main className="px-6 sm:px-12 md:px-24 pt-20">
                    <Hero language={language} t={t.hero} />
                    <Section id="about" title={t.sectionTitles.about}>
                        <AboutContent t={t.about} />
                    </Section>
                    <Section id="proyectos" title={t.sectionTitles.projects}>
                        <ProjectsContent locale={language} />
                    </Section>
                    <Section id="experiencia" title={t.sectionTitles.experience}>
                        <ExperienceTabs locale={language} />
                    </Section>
                    <Section id="contacto" title={t.sectionTitles.contact}>
                        <ContactContent t={t.contact} />
                    </Section>
                </main>
                <footer className="text-center py-8 text-text-muted">
                    <p>{t.footer.text}</p>
                </footer>
            </div>
            <SocialLinks />
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-3">
                <LanguageSwitcher language={language} setLanguage={setLanguage} />
                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
            </div>
        </>
    );
};

export default App;
