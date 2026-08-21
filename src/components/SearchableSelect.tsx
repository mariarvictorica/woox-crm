import React, { useEffect, useMemo, useRef, useState } from 'react';

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Shown on the trigger and as the "clear" option, e.g. "Todas las organizaciones". */
  allLabel: string;
  ariaLabel: string;
}

/**
 * Filterable dropdown for a long, open-ended option list (here: every
 * organization on the platform). There's no existing searchable-select
 * pattern anywhere in the app to reuse — every other picker is either a
 * native <select> (short, fixed option sets like country code or stage) or
 * a set of filter chips (Todos/Prioritarios-style, for 2-4 options). This
 * is a new, minimal one built specifically because the organization list
 * can grow past what a chip row or a plain <select> stays scannable for.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, allLabel, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const currentLabel = value ? options.find(o => o.value === value)?.label || allLabel : allLabel;

  return (
    <div className="searchable-select" ref={wrapRef}>
      <button
        type="button"
        className={`searchable-select-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{currentLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="searchable-select-panel" role="listbox" aria-label={ariaLabel}>
          <input
            ref={inputRef}
            type="text"
            className="searchable-select-input"
            placeholder="Buscar..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="searchable-select-options">
            <button
              type="button"
              className={`searchable-select-option ${value === '' ? 'selected' : ''}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
            >
              {allLabel}
            </button>
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                className={`searchable-select-option ${value === o.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && <div className="searchable-select-empty">Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
};
