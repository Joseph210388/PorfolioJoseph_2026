import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';

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

const ContactForm: React.FC<ContactFormProps> = ({ t }) => {
    const [state, handleSubmit] = useForm("manpldqa");
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t.validation.nameRequired;
        }
        
        if (!formData.email.trim()) {
            newErrors.email = t.validation.emailRequired;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t.validation.emailInvalid;
        }

        if (!formData.message.trim()) {
            newErrors.message = t.validation.messageRequired;
        } else if (formData.message.trim().length < 10) {
            newErrors.message = t.validation.messageTooShort;
        }

        return newErrors;
    };

    const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        handleSubmit(e);
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
            <p className="text-lg text-text-secondary mb-8">
                {t.description}
            </p>
            <form onSubmit={handleLocalSubmit} className="space-y-8 text-left" noValidate>
                 <div className="relative z-0 w-full group">
                    <input
                        id="name"
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300 ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'}`}
                        placeholder=" "
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    <label
                        htmlFor="name"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${errors.name ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'}`}
                    >
                        {t.nameLabel}
                    </label>
                    {errors.name && <p id="name-error" className="text-red-400 mt-1 text-sm">{errors.name}</p>}
                    <ValidationError 
                        prefix="Name" 
                        field="name"
                        errors={state.errors}
                        className="text-red-400 mt-1 text-sm"
                    />
                </div>
                <div className="relative z-0 w-full group">
                    <input
                        id="email"
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300 ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'}`}
                        placeholder=" "
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                     <label
                        htmlFor="email"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${errors.email ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'}`}
                    >
                        {t.emailLabel}
                    </label>
                    {errors.email && <p id="email-error" className="text-red-400 mt-1 text-sm">{errors.email}</p>}
                    <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                        className="text-red-400 mt-1 text-sm"
                    />
                </div>
                <div className="relative z-0 w-full group">
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className={`block py-2.5 px-0 w-full text-lg text-text-primary bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 resize-none peer transition-colors duration-300 ${errors.message ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'}`}
                        placeholder=" "
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                    ></textarea>
                    <label
                        htmlFor="message"
                        className={`peer-focus:font-medium absolute text-lg duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 ${errors.message ? 'text-red-400 peer-focus:text-red-400' : 'text-text-muted peer-focus:text-accent'}`}
                    >
                        {t.messageLabel}
                    </label>
                    {errors.message && <p id="message-error" className="text-red-400 mt-1 text-sm">{errors.message}</p>}
                    <ValidationError 
                        prefix="Message" 
                        field="message"
                        errors={state.errors}
                        className="text-red-400 mt-1 text-sm"
                    />
                </div>
                <div className="text-center pt-4">
                    <button type="submit" disabled={state.submitting} className="bg-accent text-white font-bold py-3 px-12 rounded-lg text-lg hover:bg-opacity-80 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {state.submitting ? t.submittingButton : t.submitButton}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;