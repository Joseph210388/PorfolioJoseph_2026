import React from 'react';
import { GithubIcon, LinkedinIcon, MailIcon, InstagramIcon } from './icons';

const SocialLinks: React.FC = () => {
    const socialMedia = [
        { icon: <GithubIcon />, href: 'https://github.com/Joseph210388', label: 'GitHub' },
        { icon: <LinkedinIcon />, href: 'https://es.linkedin.com/in/joseph-valderrama', label: 'LinkedIn' },
        { icon: <MailIcon />, href: 'mailto:joseph.valderrama2103@icloud.com', label: 'Email' },
        { icon: <InstagramIcon />, href: 'https://www.instagram.com/jo_red20/', label: 'Instagram' },
    ];

    return (
        <div className="hidden md:flex flex-col items-center fixed bottom-0 left-12 w-10 z-50">
            <ul className="flex flex-col items-center space-y-4">
                {socialMedia.map((social, index) => (
                    <li key={index}>
                        <a 
                            href={social.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="block p-2 text-text-muted hover:text-accent transform hover:-translate-y-1 transition-all duration-300"
                        >
                            {social.icon}
                        </a>
                    </li>
                ))}
            </ul>
            <div className="w-px h-24 bg-text-muted mt-4"></div>
        </div>
    );
};

export default SocialLinks;