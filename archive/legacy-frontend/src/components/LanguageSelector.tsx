import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../lib/i18n.tsx';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'segmented';
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'segmented',
  compact = false,
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { code: Language; label: string; shortLabel: string; native: string }[] = [
    { code: 'en', label: 'English', shortLabel: 'EN', native: 'English' },
    { code: 'hi', label: 'Hindi', shortLabel: 'HI', native: 'हिंदी' },
    { code: 'mr', label: 'Marathi', shortLabel: 'MR', native: 'मराठी' },
  ];

  const currentOption = options.find((o) => o.code === language) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Dropdown Variant (Ultra-compact for mobile headers, never overlaps)
  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={`relative shrink-0 ${className}`}>
        <button
          id="btn-lang-dropdown-trigger"
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="min-h-[44px] px-2.5 py-1.5 rounded-[6px] border-2 border-border bg-card hover:bg-muted text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs select-none"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label={`Current language: ${currentOption.label}. Click to switch language.`}
        >
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-xs font-black">{currentOption.shortLabel}</span>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div
            id="lang-dropdown-menu"
            role="listbox"
            className="absolute right-0 top-full mt-1.5 w-36 bg-card border-2 border-border rounded-[8px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] z-50 py-1 overflow-hidden"
          >
            {options.map((opt) => {
              const isActive = language === opt.code;
              return (
                <button
                  key={opt.code}
                  id={`lang-opt-${opt.code}`}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setDropdownOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="leading-tight">{opt.native}</span>
                    <span className={`text-[10px] ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {opt.label}
                    </span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Segmented Variant (for Desktop Navbar or inside Mobile Drawers)
  return (
    <div
      id="language-selector"
      className={`inline-flex items-center rounded-[6px] border border-border bg-card p-0.5 shadow-xs shrink-0 ${className}`}
      role="group"
      aria-label="Select language"
    >
      <div className={`text-muted-foreground items-center shrink-0 ${compact ? 'hidden sm:flex px-1.5 py-0.5' : 'flex px-1.5 py-1'}`}>
        <Globe className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-0.5">
        {options.map((opt) => {
          const isActive = language === opt.code;
          return (
            <button
              key={opt.code}
              id={`lang-btn-${opt.code}`}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`rounded-[4px] font-bold transition-all whitespace-nowrap flex items-center justify-center cursor-pointer min-h-[36px] ${
                compact
                  ? 'px-2 py-1 text-xs'
                  : 'px-2.5 py-1 text-xs'
              } ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-foreground hover:bg-secondary'
              }`}
              title={`Switch to ${opt.label}`}
            >
              {compact ? opt.shortLabel : opt.native}
            </button>
          );
        })}
      </div>
    </div>
  );
};
