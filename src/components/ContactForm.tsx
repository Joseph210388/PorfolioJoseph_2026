import React, { useState, useMemo, useCallback } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { sanitizeContactForm, CONTACT_FIELD_LIMITS } from '../utils/sanitizeContactForm';

interface ContactFormProps {
    t: {
        successTitle: string;
        successMessage: string;
        description: string;
        nameLabel: string;
        emailLabel: string;
        messageLabel: string;
        submitButton: string;
        submittingButton: string;
        validation: {
            nameRequired: string;
            emailRequired: string;
            emailInvalid: string;
            messageRequired: string;
            messageTooShort: string;
        }
    }
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
        [t.validation]
    );

    const sanitizedSnapshot = useMemo(() => sanitizeContactForm(formData), [formData]);

    const isFormValid = useMemo(
        () => Object.keys(validateFormData(sanitizedSnapshot)).length === 0,
        [sanitizedSnapshot, validateFormData]
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
            <div className="max-w-2xl mx-auto text-center py-10">
                <h3 className="text-2xl font-bold text-text-primary mb-4">{t.successTitle}</h3>
                <p className="text-lg text-text-secondary">{t.successMessage}</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-text-secondary mb-8">{t.description}</p>
            <form onSubmit={handleLocalSubmit} className="space-y-8 text-left" noValidate>
                <div className="relative z-0 w-full group">
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={CONTACT_FIELD_LIMITS.name}
                        autoComplete="name"
                        required
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300 ${
                            visibleErrors.name ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'
                        }`}
                        placeholder=" "
                        aria-invalid={!!visibleErrors.name}
                        aria-describedby={visibleErrors.name ? 'name-error' : undefined}
                    />
                    <label
                        htmlFor="name"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${
                            visibleErrors.name ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'
                        }`}
                    >
                        {t.nameLabel}
                    </label>
                    {visibleErrors.name && (
                        <p id="name-error" className="text-red-400 mt-1 text-sm">
                            {visibleErrors.name}
                        </p>
                    )}
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-400 mt-1 text-sm" />
                </div>
                <div className="relative z-0 w-full group">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={CONTACT_FIELD_LIMITS.email}
                        autoComplete="email"
                        required
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300 ${
                            visibleErrors.email ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'
                        }`}
                        placeholder=" "
                        aria-invalid={!!visibleErrors.email}
                        aria-describedby={visibleErrors.email ? 'email-error' : undefined}
                    />
                    <label
                        htmlFor="email"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${
                            visibleErrors.email ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'
                        }`}
                    >
                        {t.emailLabel}
                    </label>
                    {visibleErrors.email && (
                        <p id="email-error" className="text-red-400 mt-1 text-sm">
                            {visibleErrors.email}
                        </p>
                    )}
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 mt-1 text-sm" />
                </div>
                <div className="relative z-0 w-full group">
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={CONTACT_FIELD_LIMITS.message}
                        autoComplete="off"
                        required
                        rows={4}
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 resize-none peer transition-colors duration-300 ${
                            visibleErrors.message ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'
                        }`}
                        placeholder=" "
                        aria-invalid={!!visibleErrors.message}
                        aria-describedby={visibleErrors.message ? 'message-error' : undefined}
                    />
                    <label
                        htmlFor="message"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${
                            visibleErrors.message ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'
                        }`}
                    >
                        {t.messageLabel}
                    </label>
                    {visibleErrors.message && (
                        <p id="message-error" className="text-red-400 mt-1 text-sm">
                            {visibleErrors.message}
                        </p>
                    )}
                    <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-400 mt-1 text-sm" />
                </div>
                <div className="text-center pt-4">
                    <button
                        type="submit"
                        disabled={!isFormValid || state.submitting}
                        aria-disabled={!isFormValid || state.submitting}
                        className="bg-accent text-white font-bold py-3 px-12 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {state.submitting ? t.submittingButton : t.submitButton}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
