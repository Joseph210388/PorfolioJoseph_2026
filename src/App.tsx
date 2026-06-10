import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PortfolioApp from './PortfolioApp';
import AdminApp from './admin/AdminApp';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const App: React.FC = () => (
    <AuthProvider>
        <BrowserRouter basename={routerBasename}>
            <Routes>
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/*" element={<PortfolioApp />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

export default App;
