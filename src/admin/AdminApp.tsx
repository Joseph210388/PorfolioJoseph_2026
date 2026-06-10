import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminGuard from './AdminGuard';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProjectsAdminPage from './pages/ProjectsAdminPage';
import ExperienceAdminPage from './pages/ExperienceAdminPage';
import TechnologiesAdminPage from './pages/TechnologiesAdminPage';

const AdminApp: React.FC = () => (
    <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="projects" element={<ProjectsAdminPage />} />
                <Route path="experience" element={<ExperienceAdminPage />} />
                <Route path="technologies" element={<TechnologiesAdminPage />} />
            </Route>
        </Route>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);

export default AdminApp;
