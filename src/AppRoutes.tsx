import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import PortfolioApp from './PortfolioApp';
import AdminApp from './admin/AdminApp';
import AuthConfirmPage from './admin/AuthConfirmPage';

function isAuthCallbackLocation(pathname: string, search: string, hash: string): boolean {
    if (pathname === '/auth/confirm' || pathname.startsWith('/auth/')) return true;
    const blob = `${search}${hash}`;
    return /message=|token_hash=|type=email_change|access_token=|error_description=/.test(blob);
}

/** Fuera de App.tsx para que Fast Refresh no deje AppRoutes indefinido. */
const AppRoutes: React.FC = () => {
    const { pathname, search, hash } = useLocation();
    if (isAuthCallbackLocation(pathname, search, hash)) {
        return <AuthConfirmPage />;
    }
    return (
        <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*" element={<PortfolioApp />} />
        </Routes>
    );
};

export default AppRoutes;
