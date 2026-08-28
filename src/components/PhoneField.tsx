import React, { useEffect, useRef } from 'react';
import { FormField } from './FormField';
import { COUNTRY_CODES, digitsOnly } from '../data/initialData';

interface PhoneFieldProps {
  /** DOM id of the number input. Kept explicit because callers deep-link to it. */
  id: string;
  /** DOM id of the country-code select. Defaults to `${id}-code`. */
  codeId?: string;
  label?: string;
  countryCode: string;
  /** The local number, digits only. */
  number: string;
  onCountryCodeChange: (value: string) => void;
  /** Receives the value already reduced to digits. */
  onNumberChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

/**
 * The country code plus the local number, the app's one way of collecting a
 * phone. This markup lived identically in six forms — users, contacts and
 * organizations — which is how they ended up validating differently.
 *
 * The number accepts digits only. Rather than swallowing the keystroke, the
 * value is reduced to its digits, so pasting a formatted number still works
 * and only the separators are dropped.
 */
export const PhoneField: React.FC<PhoneFieldProps> = ({
  id,
  codeId,
  label = 'Teléfono',
  countryCode,
  number,
  onCountryCodeChange,
  onNumberChange,
  onBlur,
  error,
  hint,
  required = false,
  placeholder = 'Ej. 8711234567',
  autoComplete
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  /** Where to put the caret after a keystroke was filtered out. */
  const caretRef = useRef<number | null>(null);

  // Dropping characters shortens the value, and React would otherwise leave the
  // caret at the end — which makes editing the middle of a number impossible.
  useEffect(() => {
    if (caretRef.current !== null && inputRef.current) {
      const pos = caretRef.current;
      caretRef.current = null;
      inputRef.current.setSelectionRange(pos, pos);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;
    const clean = digitsOnly(raw);

    if (clean !== raw) {
      // The caret belongs after however many digits precede it, not wherever
      // the raw string put it.
      caretRef.current = digitsOnly(raw.slice(0, caret)).length;
    }

    onNumberChange(clean);
  };

  return (
    <FormField label={label} htmlFor={id} required={required} hint={hint} error={error}>
      <div className="phone-input-combo">
        <select
          id={codeId || `${id}-code`}
          aria-label="Código de país"
          className="phone-country-select"
          value={countryCode}
          onChange={e => onCountryCodeChange(e.target.value)}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          id={id}
          className="phone-number-input"
          placeholder={placeholder}
          value={number}
          onChange={handleChange}
          onBlur={onBlur}
          {...(autoComplete ? { autoComplete } : {})}
        />
      </div>
    </FormField>
  );
};
