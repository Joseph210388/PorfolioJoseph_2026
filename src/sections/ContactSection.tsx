import React from 'react';
import ContactForm from '../components/ContactForm';
import type { Translation } from '../i18n/translations';

type ContactCopy = Translation['contact'];

/**
 * Contenido de la sección contacto (mismo nivel que About/Projects/Experience).
 * Si más adelante quieres imagen o bloque visual junto al formulario, amplía el layout aquí sin tocar App.
 */
export const ContactContent: React.FC<{ t: ContactCopy }> = ({ t }) => (
    <div className="mx-auto max-w-4xl">
        <ContactForm t={t} />
    </div>
);
