import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { scrollToSectionById } from '../utils/scrollToSection';
import {
    SECTION_SCROLL_ORDER,
    internalPathToSectionId,
    normalizeAppPath,
    pathnameWithoutBase,
    toBrowserPath,
} from '../utils/sectionRoutes';

type NavPath = (typeof SECTION_SCROLL_ORDER)[number];

interface HeaderProps {
    t: {
        home: string;
        about: string;
        projects: string;
        experience: string;
        contact: string;
    }
}

const Header: React.FC<HeaderProps> = ({ t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState<NavPath>('/');
    const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

    const navLinks = useMemo(
        () =>
            [
                { path: '/' as const, text: t.home },
                { path: '/about' as const, text: t.about },
                { path: '/proyectos' as const, text: t.projects },
                { path: '/experiencia' as const, text: t.experience },
                { path: '/contacto' as const, text: t.contact },
            ] satisfies ReadonlyArray<{ path: NavPath; text: string }>,
        [t.home, t.about, t.projects, t.experience, t.contact]
    );

    const navListRef = useRef<HTMLUListElement>(null);
    const linkRefs = useRef<(HTMLLIElement | null)[]>([]);
    const scrollRafRef = useRef<number>(0);

    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, path: NavPath) => {
        event.preventDefault();
        const id = internalPathToSectionId(path);
        window.history.replaceState(null, '', toBrowserPath(path));
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
        const sections = SECTION_SCROLL_ORDER.map((path) => {
            const id = internalPathToSectionId(path);
            return document.getElementById(id);
        });

        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        const line = scrollY + vh * 0.4;

        let currentPath: NavPath = '/';
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (!section) continue;
            const top = getSectionDocumentTop(section);
            if (top <= line) {
                currentPath = SECTION_SCROLL_ORDER[i];
                break;
            }
        }

        setActiveLink((prev) => (prev === currentPath ? prev : currentPath));

        const inBrowser = normalizeAppPath(pathnameWithoutBase(window.location.pathname));
        if (normalizeAppPath(currentPath) !== inBrowser) {
            window.history.replaceState(null, '', toBrowserPath(currentPath));
        }
    }, [getSectionDocumentTop]);

    useEffect(() => {
        const onScroll = () => {
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = requestAnimationFrame(updateActiveFromScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateActiveFromScroll();
        requestAnimationFrame(updateActiveFromScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(scrollRafRef.current);
        };
    }, [updateActiveFromScroll]);

    useEffect(() => {
        const updateIndicator = () => {
            const activeLinkIndex = navLinks.findIndex((link) => link.path === activeLink);
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
                        <a
                            href={toBrowserPath('/')}
                            onClick={(e) => handleNavClick(e, '/')}
                            className="inline-block transition-transform duration-300 hover:scale-105 text-2xl font-black tracking-wider"
                        >
                            <span className="text-text-secondary">&lt;/</span>
                            <span className="text-accent">Joseph</span>
                            <span className="text-text-secondary">&gt;</span>
                        </a>
                    </div>

                    <div className="hidden md:flex items-center">
                        <ul ref={navListRef} className="relative flex items-center">
                            {navLinks.map((link, index) => (
                                <li
                                    key={link.path}
                                    ref={(el) => {
                                        linkRefs.current[index] = el;
                                    }}
                                >
                                    <a
                                        href={toBrowserPath(link.path)}
                                        onClick={(e) => handleNavClick(e, link.path)}
                                        className={`block text-text-secondary hover:text-accent transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium transform hover:-translate-y-0.5 ${activeLink === link.path ? 'font-bold text-accent' : ''}`}
                                    >
                                        <span>{link.text}</span>
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
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <ul className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <a
                                    href={toBrowserPath(link.path)}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className="block py-2 text-text-secondary hover:text-accent transition-colors duration-300"
                                >
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
