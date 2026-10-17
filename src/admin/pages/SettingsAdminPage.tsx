import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { AdminField, adminInputClass, adminTextareaClass } from '../components/AdminField';
import AdminModal from '../components/AdminModal';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { AdminToggle } from '../components/AdminToggle';
import SocialNetworkIcon from '../../components/SocialNetworkIcon';
import { showAdminToast } from '../components/AdminToast';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import {
    PROFILE_FALLBACK,
    uploadPortfolioProfileImage,
    upsertSiteSettings,
} from '../../utils/siteSettings';
import {
    SOCIAL_KIND_LABELS,
    SOCIAL_KINDS,
    isValidSocialHref,
    normalizeSocialHref,
    type SocialNetwork,
    type SocialNetworkKind,
} from '../../utils/socialNetworks';
import { cn } from '@/lib/utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_TEXT_MAX = 180;
const cardClass = 'rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6';
const editBtnClass =
    'inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm font-medium text-[var(--admin-text)] transition-colors hover:border-[var(--admin-accent)]/50 hover:text-[var(--admin-accent)]';

type ModalName = 'profile' | 'contact' | 'status' | 'social' | null;

const emptyToNull = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};

const SettingsAdminPage: React.FC = () => {
    const { settings, loading, refresh, getDisplayName, getContactEmail, getProfileImageUrl, getSocialLinks } =
        useSiteSettings();
    const { user, pendingEmail, refreshUser, updateAdminEmail } = useAuth();
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [modal, setModal] = useState<ModalName>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [banner, setBanner] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

    const [displayName, setDisplayName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [locationEs, setLocationEs] = useState('');
    const [locationEn, setLocationEn] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [availabilityEs, setAvailabilityEs] = useState('');
    const [availabilityEn, setAvailabilityEn] = useState('');
    const [socialDraft, setSocialDraft] = useState<SocialNetwork | null>(null);
    const [fieldError, setFieldError] = useState<string | null>(null);

    const socialLinks = getSocialLinks();
    const displayNameValue = getDisplayName();
    const publicEmail = getContactEmail();
    const photoUrl = getProfileImageUrl();

    const hydrateFromSettings = () => {
        setDisplayName(settings?.display_name?.trim() || PROFILE_FALLBACK.displayName);
        setNewAdminEmail(pendingEmail ?? '');
        setAdminPassword('');
        setContactEmail(settings?.contact_email?.trim() || PROFILE_FALLBACK.contactEmail);
        setLocationEs(settings?.location_es?.trim() || PROFILE_FALLBACK.locationEs);
        setLocationEn(settings?.location_en?.trim() || PROFILE_FALLBACK.locationEn);
        setIsAvailable(settings?.is_available ?? PROFILE_FALLBACK.isAvailable);
        setAvailabilityEs(settings?.availability_es?.trim() || PROFILE_FALLBACK.availabilityEs);
        setAvailabilityEn(settings?.availability_en?.trim() || PROFILE_FALLBACK.availabilityEn);
        setFieldError(null);
    };

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        if (modal) hydrateFromSettings();
        // Solo al abrir: el modal copia el estado actual.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modal]);

    const closeModal = () => {
        setModal(null);
        setSocialDraft(null);
        setAdminPassword('');
        setFieldError(null);
    };

    const openSocialModal = (network: SocialNetwork | null) => {
        setSocialDraft(
            network ?? {
                id: crypto.randomUUID(),
                kind: 'web',
                label: '',
                href: '',
            },
        );
        setFieldError(null);
        setModal('social');
    };

    const handlePhoto = async (file: File | undefined) => {
        if (!file) return;
        setUploadingPhoto(true);
        setBanner(null);
        try {
            await uploadPortfolioProfileImage(file);
            await refresh();
            setBanner({ type: 'ok', text: 'Foto de perfil actualizada.' });
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo subir la foto' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!displayName.trim()) {
            setFieldError('El nombre es obligatorio.');
            return;
        }
        const currentAdmin = (user?.email ?? '').trim().toLowerCase();
        const nextAdmin = newAdminEmail.trim().toLowerCase();
        const emailChanged = nextAdmin !== '' && nextAdmin !== currentAdmin;
        if (nextAdmin && !EMAIL_PATTERN.test(nextAdmin)) {
            setFieldError('El correo nuevo no es válido.');
            return;
        }
        if (emailChanged && !adminPassword) {
            setFieldError('Escribe la contraseña actual para cambiar el correo de acceso.');
            return;
        }

        setSaving(true);
        setBanner(null);
        try {
            await upsertSiteSettings({ display_name: displayName.trim() });
            if (emailChanged) {
                const result = await updateAdminEmail(nextAdmin, adminPassword);
                if (result.error) {
                    setFieldError(result.error);
                    return;
                }
                showAdminToast(
                    `Hay que aceptar el cambio de correo en ${nextAdmin}. El acceso sigue siendo ${currentAdmin} hasta que confirmes el enlace.`,
                );
                closeModal();
                setBanner({
                    type: 'ok',
                    text: `Cambio pedido. Auth no cambia el usuario hasta el enlace en ${nextAdmin}. Mientras tanto entra con ${currentAdmin}.`,
                });
                setNewAdminEmail(nextAdmin);
                setAdminPassword('');
                return;
            }
            await refresh();
            setBanner({ type: 'ok', text: 'Perfil actualizado.' });
            closeModal();
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar el perfil' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContact = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!EMAIL_PATTERN.test(contactEmail.trim())) {
            setFieldError('El correo público no es válido.');
            return;
        }
        setSaving(true);
        setBanner(null);
        try {
            await upsertSiteSettings({
                contact_email: contactEmail.trim().toLowerCase(),
                location_es: emptyToNull(locationEs),
                location_en: emptyToNull(locationEn),
            });
            await refresh();
            setBanner({ type: 'ok', text: 'Contacto público actualizado.' });
            closeModal();
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar el contacto' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStatus = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setBanner(null);
        try {
            await upsertSiteSettings({
                is_available: isAvailable,
                availability_es: emptyToNull(availabilityEs),
                availability_en: emptyToNull(availabilityEn),
            });
            await refresh();
            setBanner({ type: 'ok', text: 'Disponibilidad actualizada.' });
            closeModal();
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar el estado' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSocial = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!socialDraft) return;
        if (!isValidSocialHref(socialDraft.kind, socialDraft.href)) {
            setFieldError(
                socialDraft.kind === 'email' ? 'Escribe un correo válido.' : 'Usa una URL que empiece por https://',
            );
            return;
        }
        const next: SocialNetwork = {
            ...socialDraft,
            href: normalizeSocialHref(socialDraft.kind, socialDraft.href),
            label: socialDraft.label.trim() || SOCIAL_KIND_LABELS[socialDraft.kind],
        };
        const index = socialLinks.findIndex((item) => item.id === next.id);
        const payload =
            index >= 0 ? socialLinks.map((item, i) => (i === index ? next : item)) : [...socialLinks, next];
        setSaving(true);
        setBanner(null);
        try {
            await upsertSiteSettings({ social_links: payload });
            await refresh();
            setBanner({ type: 'ok', text: 'Red social guardada.' });
            closeModal();
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo guardar la red' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSocial = async (id: string) => {
        const next = socialLinks.filter((item) => item.id !== id);
        setBanner(null);
        try {
            await upsertSiteSettings({ social_links: next });
            await refresh();
            setBanner({ type: 'ok', text: 'Red eliminada.' });
        } catch (err) {
            setBanner({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo eliminar la red' });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-accent)]" aria-label="Cargando" />
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 space-y-5 overflow-y-auto overscroll-contain pb-8 text-[var(--admin-text)] sm:space-y-6">
            {banner ? (
                <p
                    className={cn(
                        'rounded-xl border px-4 py-3 text-sm',
                        banner.type === 'ok'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-600',
                    )}
                    role={banner.type === 'ok' ? 'status' : 'alert'}
                >
                    {banner.text}
                </p>
            ) : null}

            <section className={cardClass}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Perfil
                        </h2>
                        <p className="mt-1 max-w-prose text-sm text-[var(--admin-text-secondary)]">
                            Foto y nombre del portfolio, y el correo con el que entras al admin.
                        </p>
                    </div>
                    <button type="button" className={editBtnClass} onClick={() => setModal('profile')}>
                        <Pencil className="h-4 w-4" aria-hidden />
                        Editar
                    </button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <img
                        src={photoUrl}
                        alt={displayNameValue}
                        className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
                    />
                    <div className="min-w-0">
                        <p className="truncate font-semibold">{displayNameValue}</p>
                        <p className="truncate text-sm text-[var(--admin-text-muted)]">{user?.email ?? '—'}</p>
                        {pendingEmail ? (
                            <p className="mt-1 text-sm text-[var(--admin-accent)]">
                                Cambio a {pendingEmail} pendiente: confirma el enlace en ese buzón.
                            </p>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className={cardClass}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Contacto
                        </h2>
                        <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">
                            Correo y ciudad que ve el visitante. No es el login.
                        </p>
                    </div>
                    <button type="button" className={editBtnClass} onClick={() => setModal('contact')}>
                        <Pencil className="h-4 w-4" aria-hidden />
                        Editar
                    </button>
                </div>
                <p className="mt-4 truncate text-sm">{publicEmail}</p>
                <p className="text-sm text-[var(--admin-text-muted)]">
                    {settings?.location_es?.trim() || PROFILE_FALLBACK.locationEs}
                </p>
            </section>

            <section className={cardClass}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Estado
                        </h2>
                        <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">
                            El mensaje de la tarjeta de Contacto: lo escribes tú, como quieras.
                        </p>
                    </div>
                    <button type="button" className={editBtnClass} onClick={() => setModal('status')}>
                        <Pencil className="h-4 w-4" aria-hidden />
                        Editar
                    </button>
                </div>
                <p className="mt-4 text-sm">
                    {(settings?.is_available ?? true) ? 'Abierto a oportunidades' : 'No disponible'} ·{' '}
                    {settings?.availability_es?.trim() || PROFILE_FALLBACK.availabilityEs}
                </p>
            </section>

            <section className={cardClass}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Redes
                        </h2>
                        <p className="mt-1 max-w-prose text-sm text-[var(--admin-text-secondary)]">
                            Añade las que quieras. Cada una se edita en un popup.
                        </p>
                    </div>
                    <button type="button" className={editBtnClass} onClick={() => openSocialModal(null)}>
                        <Plus className="h-4 w-4" aria-hidden />
                        Añadir
                    </button>
                </div>
                <ul className="mt-4 divide-y divide-[var(--admin-border)]">
                    {socialLinks.length === 0 ? (
                        <li className="py-3 text-sm text-[var(--admin-text-muted)]">Aún no hay redes.</li>
                    ) : (
                        socialLinks.map((network) => (
                            <li key={network.id} className="flex items-center gap-3 py-3">
                                <span className="text-[var(--admin-text-muted)]">
                                    <SocialNetworkIcon kind={network.kind} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{network.label}</p>
                                    <p className="truncate text-xs text-[var(--admin-text-muted)]">{network.href}</p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-xl p-2 text-[var(--admin-text-muted)] hover:bg-slate-100 hover:text-[var(--admin-accent)]"
                                    aria-label={`Editar ${network.label}`}
                                    onClick={() => openSocialModal(network)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-xl p-2 text-[var(--admin-text-muted)] hover:bg-slate-100 hover:text-red-500"
                                    aria-label={`Eliminar ${network.label}`}
                                    onClick={() => void handleDeleteSocial(network.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </section>

            <AdminModal
                open={modal === 'profile'}
                onClose={closeModal}
                title="Editar perfil"
                className="sm:max-w-2xl"
                footer={<AdminModalFooter formId="settings-profile-form" onCancel={closeModal} saving={saving} />}
            >
                <form id="settings-profile-form" className="space-y-4" onSubmit={handleSaveProfile} noValidate>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
                        <div>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(e) => {
                                    void handlePhoto(e.target.files?.[0]);
                                    e.target.value = '';
                                }}
                            />
                            <button
                                type="button"
                                disabled={uploadingPhoto}
                                onClick={() => photoInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--admin-accent-hover)] disabled:opacity-60"
                            >
                                {uploadingPhoto ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                    <Upload className="h-4 w-4" aria-hidden />
                                )}
                                Cambiar foto
                            </button>
                            <p className="mt-1 text-xs text-[var(--admin-text-muted)]">JPG, PNG o WebP. Máx. 3 MB.</p>
                        </div>
                    </div>
                    <AdminField label="Nombre visible" htmlFor="settings-display-name" required>
                        <input
                            id="settings-display-name"
                            className={adminInputClass}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={80}
                        />
                    </AdminField>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminField label="Correo de acceso actual" htmlFor="settings-admin-email-current">
                            <input
                                id="settings-admin-email-current"
                                type="email"
                                readOnly
                                tabIndex={-1}
                                value={user?.email ?? ''}
                                className={cn(
                                    adminInputClass,
                                    'cursor-not-allowed bg-[#f1f3f5] text-[#6c757d] focus:border-[#dee2e6] focus:ring-0',
                                )}
                                autoComplete="off"
                            />
                        </AdminField>
                        <AdminField
                            label="Correo nuevo"
                            htmlFor="settings-admin-email-new"
                            hint="Déjalo vacío si no quieres cambiar el acceso."
                        >
                            <input
                                id="settings-admin-email-new"
                                type="email"
                                className={adminInputClass}
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                placeholder="nuevo@correo.com"
                                autoComplete="username"
                            />
                        </AdminField>
                    </div>
                    <AdminField
                        label="Contraseña actual"
                        htmlFor="settings-admin-password"
                        hint="Solo hace falta si escribes un correo nuevo."
                    >
                        <input
                            id="settings-admin-password"
                            type="password"
                            className={adminInputClass}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </AdminField>
                    {pendingEmail && modal === 'profile' ? (
                        <p className="text-sm text-[var(--admin-accent)]">
                            Ya hay un cambio pedido a {pendingEmail}. Guarda otra vez con la contraseña para
                            reenviar el correo, o abre el enlace si ya te llegó.
                        </p>
                    ) : null}
                    {fieldError && modal === 'profile' ? <p className="text-sm text-red-500">{fieldError}</p> : null}
                </form>
            </AdminModal>

            <AdminModal
                open={modal === 'contact'}
                onClose={closeModal}
                title="Editar contacto"
                className="sm:max-w-lg"
                footer={<AdminModalFooter formId="settings-contact-form" onCancel={closeModal} saving={saving} />}
            >
                <form id="settings-contact-form" className="space-y-4" onSubmit={handleSaveContact} noValidate>
                    <AdminField label="Correo que se muestra" htmlFor="settings-contact-email" required>
                        <input
                            id="settings-contact-email"
                            type="email"
                            className={adminInputClass}
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                        />
                    </AdminField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Ubicación (ES)" htmlFor="settings-location-es">
                            <input
                                id="settings-location-es"
                                className={adminInputClass}
                                value={locationEs}
                                onChange={(e) => setLocationEs(e.target.value)}
                            />
                        </AdminField>
                        <AdminField label="Ubicación (EN)" htmlFor="settings-location-en">
                            <input
                                id="settings-location-en"
                                className={adminInputClass}
                                value={locationEn}
                                onChange={(e) => setLocationEn(e.target.value)}
                            />
                        </AdminField>
                    </div>
                    {fieldError && modal === 'contact' ? <p className="text-sm text-red-500">{fieldError}</p> : null}
                </form>
            </AdminModal>

            <AdminModal
                open={modal === 'status'}
                onClose={closeModal}
                title="Editar estado"
                className="sm:max-w-xl"
                footer={<AdminModalFooter formId="settings-status-form" onCancel={closeModal} saving={saving} />}
            >
                <form id="settings-status-form" className="space-y-4" onSubmit={handleSaveStatus} noValidate>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--admin-border)] px-4 py-3">
                        <span className="min-w-0">
                            <span className="block text-sm font-medium">Disponible</span>
                            <span className="text-xs text-[var(--admin-text-muted)]">
                                El interruptor pinta el punto verde o gris. El mensaje lo escribes tú abajo.
                            </span>
                        </span>
                        <AdminToggle
                            checked={isAvailable}
                            onChange={setIsAvailable}
                            label="Disponible"
                        />
                    </div>
                    <AdminField
                        label="Texto en español"
                        htmlFor="settings-availability-es"
                        hint={`${availabilityEs.length}/${STATUS_TEXT_MAX}`}
                    >
                        <textarea
                            id="settings-availability-es"
                            className={adminTextareaClass}
                            value={availabilityEs}
                            onChange={(e) => setAvailabilityEs(e.target.value.slice(0, STATUS_TEXT_MAX))}
                            maxLength={STATUS_TEXT_MAX}
                            rows={3}
                            placeholder="Ej. Disponible para freelance · respondo en 48 h"
                        />
                    </AdminField>
                    <AdminField
                        label="Texto en inglés"
                        htmlFor="settings-availability-en"
                        hint={`${availabilityEn.length}/${STATUS_TEXT_MAX}`}
                    >
                        <textarea
                            id="settings-availability-en"
                            className={adminTextareaClass}
                            value={availabilityEn}
                            onChange={(e) => setAvailabilityEn(e.target.value.slice(0, STATUS_TEXT_MAX))}
                            maxLength={STATUS_TEXT_MAX}
                            rows={3}
                            placeholder="e.g. Available for freelance · I reply within 48h"
                        />
                    </AdminField>
                </form>
            </AdminModal>

            <AdminModal
                open={modal === 'social'}
                onClose={closeModal}
                title={socialDraft && socialLinks.some((item) => item.id === socialDraft.id) ? 'Editar red' : 'Añadir red'}
                className="sm:max-w-lg"
                footer={<AdminModalFooter formId="settings-social-form" onCancel={closeModal} saving={saving} />}
            >
                {socialDraft ? (
                    <form id="settings-social-form" className="space-y-4" onSubmit={handleSaveSocial} noValidate>
                        <AdminField label="Tipo" htmlFor="settings-social-kind">
                            <select
                                id="settings-social-kind"
                                className={adminInputClass}
                                value={socialDraft.kind}
                                onChange={(e) => {
                                    const kind = e.target.value as SocialNetworkKind;
                                    setSocialDraft((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  kind,
                                                  label: prev.label.trim() ? prev.label : SOCIAL_KIND_LABELS[kind],
                                              }
                                            : prev,
                                    );
                                }}
                            >
                                {SOCIAL_KINDS.map((kind) => (
                                    <option key={kind} value={kind}>
                                        {SOCIAL_KIND_LABELS[kind]}
                                    </option>
                                ))}
                            </select>
                        </AdminField>
                        <AdminField label="Nombre" htmlFor="settings-social-label">
                            <input
                                id="settings-social-label"
                                className={adminInputClass}
                                value={socialDraft.label}
                                onChange={(e) => setSocialDraft((prev) => (prev ? { ...prev, label: e.target.value } : prev))}
                                placeholder={SOCIAL_KIND_LABELS[socialDraft.kind]}
                            />
                        </AdminField>
                        <AdminField
                            label={socialDraft.kind === 'email' ? 'Correo' : 'URL'}
                            htmlFor="settings-social-href"
                            required
                        >
                            <input
                                id="settings-social-href"
                                className={adminInputClass}
                                value={socialDraft.href}
                                onChange={(e) => setSocialDraft((prev) => (prev ? { ...prev, href: e.target.value } : prev))}
                                placeholder={socialDraft.kind === 'email' ? 'tu@email.com' : 'https://'}
                            />
                        </AdminField>
                        {fieldError && modal === 'social' ? <p className="text-sm text-red-500">{fieldError}</p> : null}
                    </form>
                ) : null}
            </AdminModal>
        </div>
    );
};

export default SettingsAdminPage;
