/**
 * Accessible Form Field Component
 * WCAG 2.1 AA Compliant Form Elements
 */

import { useId, useState, type ReactNode } from 'react';
import { ScreenReaderOnly } from '../a11y/ScreenReaderOnly';
import { ErrorRegion } from '../a11y/LiveRegion';

interface FormFieldProps {
  /** Field label */
  label: string;
  /** Whether field is required */
  required?: boolean;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Children (input element) */
  children: ReactNode;
  /** Field ID (auto-generated if not provided) */
  id?: string;
  /** Additional CSS classes */
  className?: string;
  /** Hide label visually (screen readers only) */
  hideLabel?: boolean;
}

/**
 * FormField - Wrapper for accessible form inputs
 * Includes label association, error linking, and help text
 */
export function FormField({
  label,
  required = false,
  helpText,
  error,
  children,
  id: providedId,
  className = '',
  hideLabel = false,
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId || `field-${generatedId}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  // Build aria-describedby
  const describedBy = [
    helpText ? helpId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${className} ${error ? 'has-error' : ''}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className={`block text-sm font-medium text-[var(--text-secondary)] mb-2 ${
          required ? 'required-field' : ''
        } ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
        {required && (
          <ScreenReaderOnly> (required)</ScreenReaderOnly>
        )}
      </label>

      {/* Input wrapper with cloned child */}
      <div className="input-wrapper">
        {children &&
          (children as React.ReactElement).props &&
          (() => {
            const child = children as React.ReactElement;
            return (
              <child.type
                {...child.props}
                id={id}
                aria-invalid={!!error}
                aria-required={required}
                aria-describedby={describedBy}
                aria-errormessage={error ? errorId : undefined}
              />
            );
          })()}
      </div>

      {/* Help text */}
      {helpText && (
        <div id={helpId} className="field-help">
          {helpText}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div id={errorId} className="field-error" role="alert">
          <ScreenReaderOnly>Error: </ScreenReaderOnly>
          {error}
        </div>
      )}

      {/* Screen reader error announcement */}
      <ErrorRegion message={error} />
    </div>
  );
}

// ============================================================================
// Accessible Input Components
// ============================================================================

interface AccessibleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Input ID */
  id?: string;
  /** Label text */
  label: string;
  /** Whether to hide label */
  hideLabel?: boolean;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Input type */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'search'
    | 'url';
}

export function AccessibleInput({
  label,
  hideLabel,
  helpText,
  error,
  className = '',
  required,
  ...props
}: AccessibleInputProps) {
  return (
    <FormField
      label={label}
      required={required}
      hideLabel={hideLabel}
      helpText={helpText}
      error={error}
    >
      <input {...props} className={`input w-full ${className}`} />
    </FormField>
  );
}

// ============================================================================
// Accessible Select Component
// ============================================================================

interface AccessibleSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> {
  id?: string;
  label: string;
  hideLabel?: boolean;
  helpText?: string;
  error?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
}

export function AccessibleSelect({
  label,
  hideLabel,
  helpText,
  error,
  options,
  placeholder,
  className = '',
  required,
  ...props
}: AccessibleSelectProps) {
  return (
    <FormField
      label={label}
      required={required}
      hideLabel={hideLabel}
      helpText={helpText}
      error={error}
    >
      <select {...props} className={`input w-full ${className}`}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

// ============================================================================
// Accessible Checkbox Component
// ============================================================================

interface AccessibleCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id?: string;
  label: string;
  helpText?: string;
  error?: string;
}

export function AccessibleCheckbox({
  label,
  helpText,
  error,
  className = '',
  required,
  ...props
}: AccessibleCheckboxProps) {
  const generatedId = useId();
  const id = props.id || `checkbox-${generatedId}`;
  const helpId = helpText ? `${id}-help` : undefined;

  return (
    <div className={`checkbox-field ${className}`}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          className="mt-1 rounded border-[var(--border)] bg-[var(--bg)] 
                     text-[var(--primary)] focus:ring-[var(--primary)]
                     cursor-pointer"
          aria-describedby={helpId}
          aria-invalid={!!error}
          aria-required={required}
        />
        <div>
          <label
            htmlFor={id}
            className="text-sm text-[var(--text-secondary)] cursor-pointer"
          >
            {label}
            {required && (
              <span className="text-[var(--error)] ml-1">*</span>
            )}
          </label>
          {helpText && (
            <div id={helpId} className="field-help">
              {helpText}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="field-error mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Form Error Summary Component
// ============================================================================

interface FormErrorSummaryProps {
  /** Title for error summary */
  title?: string;
  /** Error messages */
  errors: Record<string, string>;
  /** Field labels for mapping */
  fieldLabels: Record<string, string>;
  /** Callback when error is clicked */
  onErrorClick?: (fieldName: string) => void;
}

export function FormErrorSummary({
  title = 'Please correct the following errors:',
  errors,
  fieldLabels,
  onErrorClick,
}: FormErrorSummaryProps) {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  return (
    <div
      className="p-4 bg-[var(--error-light)] border border-[var(--error)]/20 rounded-lg mb-6"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-sm font-semibold text-[var(--error)] mb-2">
        {title} ({errorCount} {errorCount === 1 ? 'error' : 'errors'})
      </h3>
      <ul className="space-y-1">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            <button
              type="button"
              onClick={() => onErrorClick?.(field)}
              className="text-sm text-[var(--error)] hover:underline text-left"
            >
              <strong>{fieldLabels[field] || field}:</strong> {error}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FormField;
