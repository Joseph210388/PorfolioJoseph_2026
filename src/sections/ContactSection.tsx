import React from 'react';
import ContactForm from '../components/ContactForm';
import ContactInfoCards from '../components/ContactInfoCards';
import type { Locale, Translation } from '../i18n/translations';

type ContactCopy = Translation['contact'];

/**
 * Sección contacto: formulario principal + tarjetas informativas laterales.
 * En mobile las tarjetas se apilan debajo del formulario.
 */
export const ContactContent: React.FC<{ t: ContactCopy; locale: Locale }> = ({ t, locale }) => (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:gap-8">
        <div className="rounded-2xl border border-border bg-card-background p-6 sm:p-8">
            <ContactForm t={t} />
        </div>
        <ContactInfoCards t={t.cards} locale={locale} />
    </div>
);
