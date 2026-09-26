import React from 'react';
import { useLanguage, Language } from '../lib/i18n.tsx';
import { cn } from '../lib/utils.ts';
import { Globe } from 'lucide-react';

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const options: { id: Language; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'EN' },
    { id: 'hi', label: 'हिंदी', sub: 'HI' },
    { id: 'mr', label: 'मराठी', sub: 'MR' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center bg-[#EAE4D7] p-0.5 sm:p-1 rounded-lg border border-[#DDD5C5]',
        className
      )}
    >
      <div className="items-center gap-1 px-1.5 text-[#666666] text-xs font-medium border-r border-[#DDD5C5] mr-0.5 sm:mr-1 hidden sm:flex">
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span>Lang</span>
      </div>
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {options.map((opt) => {
          const active = language === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLanguage(opt.id)}
              className={cn(
                'min-h-[32px] sm:min-h-0 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md transition-all select-none flex items-center justify-center',
                active
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-white/40'
              )}
              title={opt.label}
              aria-label={`Switch language to ${opt.label}`}
            >
              <span className="sm:hidden text-[11px] font-bold tracking-tight">{opt.sub}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
