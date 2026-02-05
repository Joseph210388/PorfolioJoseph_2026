import React, { useState, useEffect, useRef } from 'react';

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
    const [activeLink, setActiveLink] = useState('#home');
    const [indicatorStyle, setIndicatorStyle] = useState({});
    
    const navLinks = [
        { href: '#home', text: t.home },
        { href: '#about', text: t.about },
        { href: '#proyectos', text: t.projects },
        { href: '#experiencia', text: t.experience },
        { href: '#contacto', text: t.contact },
    ];

    const navListRef = useRef<HTMLUListElement>(null);
    const linkRefs = useRef<(HTMLLIElement | null)[]>([]);

    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        event.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        if (isOpen) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = navLinks.map(link => document.querySelector(link.href));
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            let currentSection = '#home';
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i] as HTMLElement;
                if (section && section.offsetTop <= scrollPosition) {
                    currentSection = navLinks[i].href;
                    break;
                }
            }
             setActiveLink(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [navLinks]);
    
    useEffect(() => {
        const activeLinkIndex = navLinks.findIndex(link => link.href === activeLink);
        const activeLiRef = linkRefs.current[activeLinkIndex];

        if (activeLiRef) {
            const textSpan = activeLiRef.querySelector('span');
            if (textSpan) {
                const indicatorLeft = activeLiRef.offsetLeft + (activeLiRef.offsetWidth - textSpan.offsetWidth) / 2;
                const indicatorWidth = textSpan.offsetWidth;

                setIndicatorStyle({
                    left: `${indicatorLeft}px`,
                    width: `${indicatorWidth}px`,
                });
            }
        }
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
                                className="absolute bottom-0 m-0 h-[3px] bg-accent rounded-full transition-all duration-300 ease-in-out"
                                style={indicatorStyle}
                                aria-hidden="true"
                            ></li>
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