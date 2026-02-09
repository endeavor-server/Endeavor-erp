import { useState, useCallback, useEffect, FormEvent } from 'react';
import { z } from 'zod';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatZodError } from '../../lib/validation';

// ============================================
// FORM CONFIGURATION TYPES
// ============================================

interface ValidationMode {
  onChange?: boolean;
  onBlur?: boolean;
  onSubmit?: boolean;
}

interface FormConfig<T extends Record<string, unknown>> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  validateOn?: ValidationMode;
  resetOnSuccess?: boolean;
}

interface UseValidatedFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: FormEvent) => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  };
}

// ============================================
// USE VALIDATED FORM HOOK
// ============================================

export function useValidatedForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseValidatedFormReturn<T> {
  const { schema, initialValues, validateOn = { onSubmit: true }, resetOnSuccess = true } = config;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Calculate initial values for reference
  const initialValuesRef = JSON.stringify(initialValues);

  // Check if dirty
  useEffect(() => {
    setIsDirty(JSON.stringify(values) !== initialValuesRef);
  }, [values, initialValuesRef]);

  // Check overall validity
  const isValid = Object.keys(errors).length === 0;

  const validateFieldValue = useCallback(
    (field: keyof T, value: unknown): string | undefined => {
      try {
        const fieldSchema = schema.shape?.[field as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message;
        }
        return 'Invalid value';
      }
    },
    [schema]
  );

  const validateFormValues = useCallback(
    (formValues: T): Record<string, string> => {
      try {
        schema.parse(formValues);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return formatZodError(error);
        }
        return { form: 'Validation failed' };
      }
    },
    [schema]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOn.onChange) {
        const error = validateFieldValue(field, value);
        setErrors((prev) => {
          const next = { ...prev };
          if (error) {
            next[field as string] = error;
          } else {
            delete next[field as string];
          }
          return next;
        });
      }
    },
    [validateFieldValue, validateOn.onChange]
  );

  const setFieldTouched = useCallback(
    (field: keyof T, touchedValue = true) => {
      setTouched((prev) => ({ ...prev, [field]: touchedValue }));

      if (validateOn.onBlur && touchedValue) {
        const error = validateFieldValue(field, values[field]);
        setErrors((prev) => {
          const next = { ...prev };
          if (error) {
            next[field as string] = error;
          } else {
            delete next[field as string];
          }
          return next;
        });
      }
    },
    [validateFieldValue, validateOn.onBlur, values]
  );

  const setAllValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const error = validateFieldValue(field, values[field]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field as string] = error;
        } else {
          delete next[field as string];
        }
        return next;
      });
      return !error;
    },
    [validateFieldValue, values]
  );

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateFormValues(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validateFormValues, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e: FormEvent) => {
        e.preventDefault();

        // Touch all fields
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        setTouched(allTouched);

        // Validate form
        const validationErrors = validateFormValues(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
          return;
        }

        setIsSubmitting(true);

        try {
          await onSubmit(values);
          if (resetOnSuccess) {
            resetForm();
          }
        } catch (error) {
          console.error('Form submission error:', error);
          setErrors((prev) => ({
            ...prev,
            form: error instanceof Error ? error.message : 'Submission failed',
          }));
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [validateFormValues, values, resetForm, resetOnSuccess]
  );

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: (value: unknown) => setFieldValue(field, value),
      onBlur: () => setFieldTouched(field),
      error: touched[field as string] ? errors[field as string] : undefined,
      touched: touched[field as string] || false,
    }),
    [values, errors, touched, setFieldValue, setFieldTouched]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setFieldValue,
    setFieldTouched,
    setValues: setAllValues,
    validateField,
    validateForm,
    resetForm,
    handleSubmit,
    getFieldProps,
  };
}

// ============================================
// VALIDATED FORM COMPONENT
// ============================================

interface ValidatedFormProps<T extends Record<string, unknown>> {
  initialValues: T;
  schema: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  children: React.ReactNode | ((props: UseValidatedFormReturn<T>) => React.ReactNode);
  validateOn?: ValidationMode;
  resetOnSuccess?: boolean;
  className?: string;
  showErrorSummary?: boolean;
}

export function ValidatedForm<T extends Record<string, unknown>>({
  initialValues,
  schema,
  onSubmit,
  children,
  validateOn,
  resetOnSuccess = false,
  className,
  showErrorSummary = true,
}: ValidatedFormProps<T>) {
  const form = useValidatedForm<T>({
    schema,
    initialValues,
    validateOn,
    resetOnSuccess,
  });

  const childrenContent = typeof children === 'function' ? children(form) : children;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {showErrorSummary && Object.keys(form.errors).length > 0 && (
        <FormErrorSummary errors={form.errors} className="mb-4" />
      )}
      {childrenContent}
    </form>
  );
}

// ============================================
// FORM ERROR SUMMARY COMPONENT
// ============================================

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorCount = Object.keys(errors).filter((k) => k !== 'form').length;
  const formError = errors.form;

  if (errorCount === 0 && !formError) return null;

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="w-5 h-5" />
        <h4 className="font-medium">
          {formError || `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''}`}
        </h4>
      </div>
      {errorCount > 0 && (
        <ul className="mt-2 space-y-1">
          {Object.entries(errors)
            .filter(([key]) => key !== 'form')
            .map(([field, message]) => (
              <li key={field} className="text-sm text-red-600">
                •{' '}
                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                {message}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// FORM SUBMIT BUTTON
// ============================================

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  isValid?: boolean;
  showSuccess?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({
  isSubmitting,
  isValid,
  showSuccess,
  children,
  className,
  disabled,
  onClick,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        ${
          showSuccess
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : showSuccess ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span>Saved!</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================
// FORM LOADING STATE
// ============================================

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto w-16 h-16 text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ============================================
// DATA TABLE LOADING STATE
// ============================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
        {[...Array(columns)].map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800"
        >
          {[...Array(columns)].map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 flex-1 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
              style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

import type { ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
}

export class FormErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form Error Boundary caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.resetError);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Something went wrong</h3>
          </div>
          <p className="text-red-600 mb-4">{this.state.error.message}</p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Need to import React for class component
import React from 'react';