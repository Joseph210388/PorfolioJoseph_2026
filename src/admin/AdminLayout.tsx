import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAdminPageMeta } from './adminPageMeta';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopBar } from './components/AdminTopBar';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { title, description } = getAdminPageMeta(pathname);

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login', { replace: true });
    };

    return (
        <div className="admin-shell flex min-h-screen">
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <div
                className={cn(
                    'fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                )}
            >
                <AdminSidebar onSignOut={handleSignOut} onClose={() => setMobileOpen(false)} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col bg-[var(--admin-main)]">
                <AdminTopBar
                    title={title}
                    description={description}
                    email={user?.email}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
