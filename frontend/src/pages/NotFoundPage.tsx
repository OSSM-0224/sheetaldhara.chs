import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home } from 'lucide-react';
import { Button } from '../components/ui/button.tsx';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-14 h-14 rounded-2xl bg-[#EAE4D7] text-[#2C5E3B] flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#111111]">404 — Page Not Found</h1>
      <p className="text-sm text-[#666666] max-w-sm mt-2 mb-6">
        The requested page does not exist in the SHEETALDHARA CHS vehicle management portal.
      </p>
      <Link to="/">
        <Button className="gap-2">
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
