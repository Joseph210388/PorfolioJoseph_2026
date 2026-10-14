import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';
import PortfolioApp from './PortfolioApp';
import AdminApp from './admin/AdminApp';
import { isSupabaseConfigured } from './utils/supabase';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const MissingEnvScreen: React.FC = () => (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1C3A] px-4">
        <div className="max-w-lg rounded-2xl border border-white/10 bg-[#112240] p-6 text-[#F8F9FA] sm:p-8">
            <h1 className="text-xl font-semibold tracking-tight">Falta configuración local</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#8892b0]">
                La app no arranca porque no hay archivo <code className="text-[#EC4869]">.env.local</code> con las
                variables de Supabase. Cópialas desde el proyecto Supabase del portfolio (Settings → API).
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-xs text-[#F8F9FA]">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...`}
            </pre>
            <p className="mt-3 text-xs text-[#8892b0]">
                Crea el archivo en la raíz del repo, guarda, y reinicia <code>npm run dev</code>.
            </p>
        </div>
    </div>
);

const App: React.FC = () => {
    if (!isSupabaseConfigured) {
        return <MissingEnvScreen />;
    }

    return (
        <AuthProvider>
            <SiteSettingsProvider>
                <BrowserRouter basename={routerBasename}>
                    <Routes>
                        <Route path="/admin/*" element={<AdminApp />} />
                        <Route path="/*" element={<PortfolioApp />} />
                    </Routes>
                </BrowserRouter>
            </SiteSettingsProvider>
        </AuthProvider>
    );
};

export default App;
