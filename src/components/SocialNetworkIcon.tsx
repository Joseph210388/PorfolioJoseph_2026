import React from 'react';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';
import type { SocialNetworkKind } from '../utils/socialNetworks';

interface SocialNetworkIconProps {
    kind: SocialNetworkKind;
}

const SvgShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
    >
        {children}
    </svg>
);

const SocialNetworkIcon: React.FC<SocialNetworkIconProps> = ({ kind }) => {
    switch (kind) {
        case 'github':
            return <GithubIcon />;
        case 'linkedin':
            return <LinkedinIcon />;
        case 'email':
            return <MailIcon />;
        case 'instagram':
            return (
                <SvgShell>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </SvgShell>
            );
        case 'youtube':
            return (
                <SvgShell>
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </SvgShell>
            );
        case 'x':
            return (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return (
                <SvgShell>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </SvgShell>
            );
    }
};

export default SocialNetworkIcon;
