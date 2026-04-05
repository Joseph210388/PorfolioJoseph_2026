import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { scrollToSectionById } from '../utils/scrollToSection';

interface HeaderProps {
    t: {
        home: string;
        about: string;
        projects: string;
        experience: string;
        contact: string;
    }
}

const SECTION_HREFS = ['#home', '#about', '#proyectos', '#experiencia', '#contacto'] as const;

const Header: React.FC<HeaderProps> = ({ t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState<string>('#home');
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

    const navLinks = useMemo(
        () => [
            { href: '#home' as const, text: t.home },
            { href: '#about' as const, text: t.about },
            { href: '#proyectos' as const, text: t.projects },
            { href: '#experiencia' as const, text: t.experience },
            { href: '#contacto' as const, text: t.contact },
        ],
        [t.home, t.about, t.projects, t.experience, t.contact]
    );

    const navListRef = useRef<HTMLUListElement>(null);
    const linkRefs = useRef<(HTMLLIElement | null)[]>([]);
    const scrollRafRef = useRef<number>(0);

    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        event.preventDefault();
        const id = href.replace(/^#/, '');
        if (!id) return;
        window.history.replaceState(null, '', `#${id}`);
        scrollToSectionById(id, 'smooth');
        if (isOpen) {
            setIsOpen(false);
        }
    };

    const getSectionDocumentTop = useCallback((el: Element) => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
    }, []);

    const updateActiveFromScroll = useCallback(() => {
        const sections = SECTION_HREFS.map((href) => document.querySelector(href));

        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // Línea de activación ~40% del viewport (no cap en px: un tope de 120px hacía que en
        // pantallas altas el <section> siguiente ya fuera visible pero su offsetTop seguía por debajo de la línea → sección equivocada).
        const line = scrollY + vh * 0.4;

        let currentSection: string = '#home';
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (!section) continue;
            const top = getSectionDocumentTop(section);
            if (top <= line) {
                currentSection = SECTION_HREFS[i];
                break;
            }
        }

        setActiveLink((prev) => (prev === currentSection ? prev : currentSection));
    }, [getSectionDocumentTop]);

    useEffect(() => {
        const onScroll = () => {
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = requestAnimationFrame(updateActiveFromScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('hashchange', updateActiveFromScroll, { passive: true });
        updateActiveFromScroll();
        requestAnimationFrame(updateActiveFromScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('hashchange', updateActiveFromScroll);
            cancelAnimationFrame(scrollRafRef.current);
        };
    }, [updateActiveFromScroll]);

    useEffect(() => {
        const updateIndicator = () => {
            const activeLinkIndex = navLinks.findIndex((link) => link.href === activeLink);
            const activeLiRef = linkRefs.current[activeLinkIndex];

            if (activeLiRef) {
                const textSpan = activeLiRef.querySelector('span');
                if (textSpan) {
                    const indicatorLeft = activeLiRef.offsetLeft + (activeLiRef.offsetWidth - textSpan.offsetWidth) / 2;
                    const indicatorWidth = textSpan.offsetWidth;

                    setIndicatorStyle({
                        transform: `translateX(${indicatorLeft}px)`,
                        width: indicatorWidth,
                    });
                }
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator, { passive: true });
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeLink, navLinks]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-header-bg backdrop-blur-sm shadow-md border-b border-border/20 dark:border-card-background">
            <nav className="container mx-auto px-6 sm:px-12 md:px-24 py-5">
                <div className="flex items-center justify-between">
                    <div className="cursor-pointer">
                        <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="inline-block transition-transform duration-300 hover:scale-105 text-2xl font-black tracking-wider">
                           <span className="text-text-secondary">&lt;/</span><span className="text-accent">Joseph</span><span className="text-text-secondary">&gt;</span>
                        </a>
                    </div>

                    <div className="hidden md:flex items-center">
                        <ul ref={navListRef} className="relative flex items-center">
                            {navLinks.map((link, index) => (
                                // FIX: Wrapped ref callback in braces to ensure void return type, resolving assignability error.
                                <li key={link.href} ref={el => { linkRefs.current[index] = el; }}>
                                    <a 
                                        href={link.href} 
                                        onClick={(e) => handleNavClick(e, link.href)} 
                                        className={`block text-text-secondary hover:text-accent transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium transform hover:-translate-y-0.5 ${activeLink === link.href ? 'font-bold text-accent' : ''}`}
                                    >
                                        <span>
                                            {link.text}
                                        </span>
                                    </a>
                                </li>
                            ))}
                            <li
                                className="absolute bottom-0 left-0 m-0 h-[3px] rounded-full bg-accent will-change-[transform,width] transition-[transform,width] duration-150 ease-out"
                                style={indicatorStyle}
                                aria-hidden="true"
                            />
                        </ul>
                    </div>
                    
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-text-secondary focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <ul className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                             <li key={link.href}>
                                <a href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="block py-2 text-text-secondary hover:text-accent transition-colors duration-300">
                                    {link.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;