import React, { useState, useMemo, useCallback } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Send } from 'lucide-react';
import { sanitizeContactForm, CONTACT_FIELD_LIMITS } from '../utils/sanitizeContactForm';
import { cn } from '@/lib/utils';

interface ContactFormProps {
    t: {
        formTitle: string;
        formSubtitle: string;
        successTitle: string;
        successMessage: string;
        nameLabel: string;
        namePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        messageLabel: string;
        messagePlaceholder: string;
        submitButton: string;
        submittingButton: string;
        validation: {
            nameRequired: string;
            emailRequired: string;
            emailInvalid: string;
            messageRequired: string;
            messageTooShort: string;
        };
    };
}

type FormErrors = {
    name?: string;
    email?: string;
    message?: string;
};

type FormData = {
    name: string;
    email: string;
    message: string;
};

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const inputClass = (hasError: boolean) =>
    cn(
        'block w-full rounded-xl border bg-background px-4 py-3 text-base text-text-primary',
        'placeholder:text-text-muted/70 transition-colors duration-300',
        'focus:outline-none focus:ring-2 focus:ring-accent/25',
        hasError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent',
    );

const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted';

const ContactForm: React.FC<ContactFormProps> = ({ t }) => {
    const [state, handleSubmit] = useForm('manpldqa');
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
    const [hasInteracted, setHasInteracted] = useState(false);

    const validateFormData = useCallback(
        (data: FormData): FormErrors => {
            const newErrors: FormErrors = {};

            if (!data.name.trim()) {
                newErrors.name = t.validation.nameRequired;
            }

            if (!data.email.trim()) {
                newErrors.email = t.validation.emailRequired;
            } else if (!isValidEmail(data.email)) {
                newErrors.email = t.validation.emailInvalid;
            }

            if (!data.message.trim()) {
                newErrors.message = t.validation.messageRequired;
            } else if (data.message.trim().length < 10) {
                newErrors.message = t.validation.messageTooShort;
            }

            return newErrors;
        },
        [t.validation],
    );

    const sanitizedSnapshot = useMemo(() => sanitizeContactForm(formData), [formData]);

    const isFormValid = useMemo(
        () => Object.keys(validateFormData(sanitizedSnapshot)).length === 0,
        [sanitizedSnapshot, validateFormData],
    );

    /** Errores mostrados: email en vivo al escribir; resto tras la primera interacción. */
    const visibleErrors = useMemo(() => {
        if (!hasInteracted) {
            const e: FormErrors = {};
            if (formData.email.length > 0 && formData.email.trim() && !isValidEmail(formData.email)) {
                e.email = t.validation.emailInvalid;
            }
            return e;
        }
        return validateFormData(formData);
    }, [formData, hasInteracted, t.validation, validateFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setHasInteracted(true);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setHasInteracted(true);
        if (!isFormValid) return;

        const cleaned = sanitizeContactForm(formData);
        setFormData(cleaned);

        const validationErrors = validateFormData(cleaned);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        await handleSubmit(cleaned);
    };

    if (state.succeeded) {
        return (
            <div className="py-10 text-center">
                <h3 className="mb-4 text-2xl font-bold text-text-primary">{t.successTitle}</h3>
                <p className="text-lg text-text-secondary">{t.successMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <header className="mb-8 text-left">
                <h3 className="text-2xl font-bold tracking-tight text-accent sm:text-3xl">{t.formTitle}</h3>
                <p className="mt-2 text-base text-text-secondary">{t.formSubtitle}</p>
            </header>

            <form onSubmit={handleLocalSubmit} className="space-y-6 text-left" noValidate>
                <div>
                    <label htmlFor="name" className={labelClass}>
                        {t.nameLabel}
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={CONTACT_FIELD_LIMITS.name}
                        autoComplete="name"
                        required
                        placeholder={t.namePlaceholder}
                        className={inputClass(!!visibleErrors.name)}
                        aria-invalid={!!visibleErrors.name}
                        aria-describedby={visibleErrors.name ? 'name-error' : undefined}
                    />
                    {visibleErrors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-400">
                            {visibleErrors.name}
                        </p>
                    )}
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>
                        {t.emailLabel}
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={CONTACT_FIELD_LIMITS.email}
                        autoComplete="email"
                        required
                        placeholder={t.emailPlaceholder}
                        className={inputClass(!!visibleErrors.email)}
                        aria-invalid={!!visibleErrors.email}
                        aria-describedby={visibleErrors.email ? 'email-error' : undefined}
                    />
                    {visibleErrors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-400">
                            {visibleErrors.email}
                        </p>
                    )}
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                    <label htmlFor="message" className={labelClass}>
                        {t.messageLabel}
                    </label>
                    <div className="relative">
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            maxLength={CONTACT_FIELD_LIMITS.message}
                            autoComplete="off"
                            required
                            rows={5}
                            placeholder={t.messagePlaceholder}
                            className={cn(inputClass(!!visibleErrors.message), 'resize-none pb-8')}
                            aria-invalid={!!visibleErrors.message}
                            aria-describedby={visibleErrors.message ? 'message-error' : undefined}
                        />
                        <span className="pointer-events-none absolute bottom-3 right-3 text-xs text-text-muted">
                            {formData.message.length}/{CONTACT_FIELD_LIMITS.message}
                        </span>
                    </div>
                    {visibleErrors.message && (
                        <p id="message-error" className="mt-1 text-sm text-red-400">
                            {visibleErrors.message}
                        </p>
                    )}
                    <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-sm text-red-400" />
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid || state.submitting}
                    aria-disabled={!isFormValid || state.submitting}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5',
                        'text-base font-semibold text-white transition-all duration-300',
                        'hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    <Send className="h-4 w-4" aria-hidden />
                    {state.submitting ? t.submittingButton : t.submitButton}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
