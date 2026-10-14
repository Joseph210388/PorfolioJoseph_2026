export const SOCIAL_KINDS = ['github', 'linkedin', 'x', 'instagram', 'youtube', 'email', 'web'] as const;

export type SocialNetworkKind = (typeof SOCIAL_KINDS)[number];

export type SocialNetwork = {
    id: string;
    kind: SocialNetworkKind;
    label: string;
    href: string;
};

export const SOCIAL_KIND_LABELS: Record<SocialNetworkKind, string> = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    x: 'X (Twitter)',
    instagram: 'Instagram',
    youtube: 'YouTube',
    email: 'Email',
    web: 'Web',
};

export const DEFAULT_SOCIAL_LINKS: SocialNetwork[] = [
    {
        id: 'github',
        kind: 'github',
        label: 'GitHub',
        href: 'https://github.com/Joseph210388',
    },
    {
        id: 'linkedin',
        kind: 'linkedin',
        label: 'LinkedIn',
        href: 'https://es.linkedin.com/in/joseph-valderrama',
    },
];

function isKind(value: unknown): value is SocialNetworkKind {
    return typeof value === 'string' && (SOCIAL_KINDS as readonly string[]).includes(value);
}

export function parseSocialLinks(raw: unknown): SocialNetwork[] {
    if (!Array.isArray(raw)) return [];
    const parsed: SocialNetwork[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const row = item as Record<string, unknown>;
        const href = typeof row.href === 'string' ? row.href.trim() : '';
        const kind = isKind(row.kind) ? row.kind : 'web';
        if (!href) continue;
        const label =
            typeof row.label === 'string' && row.label.trim()
                ? row.label.trim()
                : SOCIAL_KIND_LABELS[kind];
        const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : crypto.randomUUID();
        parsed.push({ id, kind, label, href });
    }
    return parsed;
}

export function normalizeSocialHref(kind: SocialNetworkKind, value: string): string {
    const trimmed = value.trim();
    if (kind === 'email') {
        if (trimmed.startsWith('mailto:')) return trimmed;
        return `mailto:${trimmed}`;
    }
    return trimmed;
}

export function isValidSocialHref(kind: SocialNetworkKind, value: string): boolean {
    const href = normalizeSocialHref(kind, value);
    if (kind === 'email') {
        const email = href.replace(/^mailto:/i, '');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    try {
        const parsed = new URL(href);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function isExternalSocialHref(href: string): boolean {
    return !href.startsWith('mailto:');
}
