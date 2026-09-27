import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.ts';

import { LoginPage } from './pages/LoginPage.tsx';
import { AdminLoginPage } from './pages/AdminLoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { MyVehiclesPage } from './pages/MyVehiclesPage.tsx';
import { WatchmanPage } from './pages/WatchmanPage.tsx';
import { AdminResidentsPage } from './pages/admin/AdminResidentsPage.tsx';
import { AdminVehiclesPage } from './pages/admin/AdminVehiclesPage.tsx';
import { AdminWatchmenPage } from './pages/admin/AdminWatchmenPage.tsx';
import { AdminOutsiderVehiclesPage } from './pages/admin/AdminOutsiderVehiclesPage.tsx';
import { AdminLogsPage } from './pages/admin/AdminLogsPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

import { ProtectedRoute } from './components/layout/ProtectedRoute.tsx';

// Role-based root redirector component
function RootRedirector() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#DDD5C5] border-t-[#2C5E3B] rounded-full animate-spin mb-3" />
        <p className="text-sm text-[#666666] font-medium">SHEETALDHARA CHS</p>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'WATCHMAN') {
    return <Navigate to="/watchman" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin/residents" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  // Role redirect root
  {
    path: '/',
    element: <RootRedirector />,
  },
  // Public Login
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Public Admin Login (kept off the main portal login on purpose)
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  // Resident & Admin accessible routes
  {
    element: <ProtectedRoute allowedRoles={['RESIDENT', 'ADMIN']} />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
  // Resident-only routes
  {
    element: <ProtectedRoute allowedRoles={['RESIDENT']} />,
    children: [
      {
        path: '/my-vehicles',
        element: <MyVehiclesPage />,
      },
    ],
  },
  // Watchman-only routes
  {
    element: <ProtectedRoute allowedRoles={['WATCHMAN']} />,
    children: [
      {
        path: '/watchman',
        element: <WatchmanPage />,
      },
    ],
  },
  // Admin-only routes
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} loginPath="/admin/login" />,
    children: [
      {
        path: '/admin/residents',
        element: <AdminResidentsPage />,
      },
      {
        path: '/admin/vehicles',
        element: <AdminVehiclesPage />,
      },
      {
        path: '/admin/watchmen',
        element: <AdminWatchmenPage />,
      },
      {
        path: '/admin/outsider-vehicles',
        element: <AdminOutsiderVehiclesPage />,
      },
      {
        path: '/admin/logs',
        element: <AdminLogsPage />,
      },
    ],
  },
  // 404 catch-all
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
