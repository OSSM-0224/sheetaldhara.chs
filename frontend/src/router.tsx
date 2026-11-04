import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage.tsx';
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

export const router = createBrowserRouter([
  // Public landing page
  {
    path: '/',
    element: <LandingPage />,
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
