import React from 'react';
import { FormField } from './FormField';
import { capitalizeFirst } from '../data/initialData';

interface TextFieldProps {
  label: string;
  id: string;
  value: string;
  /** Receives the value already capitalized, unless `capitalize` is off. */
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  /** Marks the field for Dialog's autofocus pass. */
  autoFocus?: boolean;
  autoComplete?: string;
  /** Renders a textarea with this many rows instead of a single-line input. */
  rows?: number;
  /**
   * Off for the few fields where a leading capital would be wrong. On by
   * default, because every field this component is used for is a name, a title
   * or a sentence.
   */
  capitalize?: boolean;
}

/**
 * A single-line (or multi-line) text field for anything a person writes by
 * hand: their name, their job title, a company, an address, an opportunity.
 *
 * The first character is capitalized as they type, so "maria" becomes "Maria"
 * with nothing to go back and fix. Only the first character — title-casing
 * every word would mangle "de la Cruz" and "Pinturas y Solventes del Bajío".
 *
 * Not for email or password: neither wants a capital, and both are collected
 * with a plain input inside FormField.
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  placeholder,
  autoFocus = false,
  autoComplete,
  rows,
  capitalize = true
}) => {
  // Capitalizing never changes the length, so the caret stays where the user
  // left it and no restoration is needed — unlike PhoneField.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const raw = e.target.value;
    onChange(capitalize ? capitalizeFirst(raw) : raw);
  };

  const shared = {
    id,
    value,
    onChange: handleChange,
    onBlur,
    ...(placeholder ? { placeholder } : {}),
    ...(autoFocus ? { 'data-autofocus': true } : {}),
    ...(autoComplete ? { autoComplete } : {})
  };

  return (
    <FormField label={label} htmlFor={id} required={required} hint={hint} error={error}>
      {rows ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type="text" {...shared} />
      )}
    </FormField>
  );
};
