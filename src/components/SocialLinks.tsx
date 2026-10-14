import React, { useMemo } from 'react';
import SocialNetworkIcon from './SocialNetworkIcon';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { isExternalSocialHref } from '../utils/socialNetworks';

const SocialLinks: React.FC = () => {
    const { getContactEmail, getSocialLinks } = useSiteSettings();
    const contactEmail = getContactEmail();
    const socialLinks = getSocialLinks();

    const items = useMemo(() => {
        const list = socialLinks.map((network) => ({
            id: network.id,
            href: network.href,
            label: network.label,
            kind: network.kind,
            external: isExternalSocialHref(network.href),
        }));
        const hasMail = list.some((item) => item.kind === 'email' || item.href.startsWith('mailto:'));
        if (!hasMail && contactEmail) {
            list.push({
                id: 'contact-mail',
                href: `mailto:${contactEmail}`,
                label: 'Email',
                kind: 'email' as const,
                external: false,
            });
        }
        return list;
    }, [socialLinks, contactEmail]);

    return (
        <div className="fixed bottom-0 left-4 z-50 hidden w-10 flex-col items-center md:left-12 md:flex">
            <ul className="flex flex-col items-center space-y-4">
                {items.map((social) => (
                    <li key={social.id}>
                        <a
                            href={social.href}
                            target={social.external ? '_blank' : undefined}
                            rel={social.external ? 'noopener noreferrer' : undefined}
                            aria-label={social.label}
                            className="block p-2 text-text-muted transition-all duration-300 hover:-translate-y-1 hover:text-accent"
                        >
                            <SocialNetworkIcon kind={social.kind} />
                        </a>
                    </li>
                ))}
            </ul>
            <div className="mt-4 h-24 w-px bg-text-muted" />
        </div>
    );
};

export default SocialLinks;
