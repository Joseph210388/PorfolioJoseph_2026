import React, { useState, useEffect } from 'react';

interface HeroProps {
    t: {
        greeting: string;
        name: string;
        subtitles: string[];
        description: string;
        resumeButton: string;
        contactButton: string;
    }
}

const Hero: React.FC<HeroProps> = ({ t }) => {
    const [subtitleIndex, setSubtitleIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        // Reset animation on language change
        setDisplayedText('');
        setIsDeleting(false);
        setSubtitleIndex(0);
    }, [t]);

    useEffect(() => {
        const handleTyping = () => {
            const currentSubtitle = t.subtitles[subtitleIndex];
            
            if (isDeleting) {
                if (displayedText.length > 0) {
                    setDisplayedText(currentSubtitle.substring(0, displayedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setSubtitleIndex((prevIndex) => (prevIndex + 1) % t.subtitles.length);
                }
            } 
            else {
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
    }, [displayedText, isDeleting, subtitleIndex, t]);
    
    const handleScrollToContact = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24 flex items-center min-h-[calc(100vh-80px)] py-20">
                <div className="w-full grid md:grid-cols-2 gap-10 items-center">
                    <div className="animate-fade-in-up">
                        <p className="text-accent text-lg font-medium mb-2">{t.greeting}</p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary leading-tight">
                            {t.name} <span className="text-accent">Joseph Valderrama</span>.
                        </h1>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-secondary mt-2">
                            {displayedText}
                            <span className="animate-blink">|</span>
                        </h2>
                        <p className="text-text-secondary mt-4 max-w-xl">
                            {t.description}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                            <a href="https://raw.githubusercontent.com/Joseph210388/Porfolio/main/CV_Joseph_Valderrama.pdf" target="_blank" rel="noopener noreferrer" className="bg-accent text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105">
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
                    <div className="hidden md:flex justify-center items-center animate-fade-in">
                        <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-card-background border-2 border-border shadow-2xl overflow-hidden">
                            <img 
                                src="https://res.cloudinary.com/deqzz76ni/image/upload/v1761150438/0da1ca0f-fa20-4bdb-bb1f-001e11681756_vs2hi9.jpg" 
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