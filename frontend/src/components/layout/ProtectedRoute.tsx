import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { UserRole } from '../../types.ts';
import { Navbar } from './Navbar.tsx';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  loginPath?: string;
}

export function ProtectedRoute({ allowedRoles, loginPath = '/login' }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-[#DDD5C5] border-t-[#2C5E3B] rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#666666] font-medium">SHEETALDHARA CHS</p>
      </div>
    );
  }

  // Not logged in
  if (!role) {
    return <Navigate to={loginPath} replace />;
  }

  // Role mismatch check
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'WATCHMAN') {
      return <Navigate to="/watchman" replace />;
    }
    if (role === 'ADMIN') {
      return <Navigate to="/admin/residents" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#111111]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-[#DDD5C5] bg-[#FAF7F0] py-6 text-center text-xs text-[#666666]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-[#333333]">SHEETALDHARA CO-OPERATIVE HOUSING SOCIETY LTD.</p>
          <p className="mt-1">Secure Resident Parking & Gate Management System</p>
        </div>
      </footer>
    </div>
  );
}
