import { useState, useCallback } from 'react';
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FORM FIELD COMPONENT
// ============================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
  description,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// TEXT INPUT COMPONENT
// ============================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
}

export function TextInput({ error, hint, className, ...props }: TextInputProps) {
  return (
    <div className="space-y-1">
      <input
        className={cn(
          'w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors',
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ============================================
// TEXTAREA COMPONENT
// ============================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  maxLength?: number;
}

export function TextArea({ error, maxLength, className, value, ...props }: TextAreaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-1">
      <textarea
        className={cn(
          'w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors resize-none',
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        value={value}
        {...props}
      />
      {maxLength && (
        <div className="flex justify-between text-xs">
          <span>{error && <span className="text-red-500">{error}</span>}</span>
          <span className={cn('text-gray-400', charCount > maxLength * 0.9 && 'text-amber-500')}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// SELECT COMPONENT
// ============================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ error, options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      <select
        className={cn(
          'w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors appearance-none cursor-pointer',
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// CHECKBOX & RADIO COMPONENTS
// ============================================

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function Checkbox({ label, description, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
      <input
        type="checkbox"
        className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        {...props}
      />
      <div className="text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

interface RadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ name, options, value, onChange, className }: RadioGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

// ============================================
// PASSWORD INPUT COMPONENT
// ============================================

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  showStrength?: boolean;
}

export function PasswordInput({ error, showStrength, className, value, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const password = typeof value === 'string' ? value : '';

  const getPasswordStrength = useCallback((pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];

    return { score, label: labels[score], color: colors[score] };
  }, []);

  const strength = showStrength ? getPasswordStrength(password) : null;

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-300 dark:border-gray-600',
            className
          )}
          value={value}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && password && (
        <div className="space-y-1">
          <div className="flex gap-1 h-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors',
                  i < (strength?.score || 0) ? strength?.color : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Strength: <span className={cn('font-medium', strength?.color.replace('bg-', 'text-'))}>{strength?.label}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// AMOUNT INPUT COMPONENT
// ============================================

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  error?: string;
  currency?: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function AmountInput({
  error,
  currency = '₹',
  onChange,
  min = 0,
  max,
  className,
  value,
  ...props
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= min && (!max || val <= max)) {
      onChange(val);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
        {currency}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step="0.01"
        className={cn(
          'w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors',
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 dark:border-gray-600',
          className
        )}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

// ============================================
// DATE INPUT COMPONENT
// ============================================

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  min?: string;
  max?: string;
}

export function DateInput({ error, className, ...props }: DateInputProps) {
  return (
    <input
      type="date"
      className={cn(
        'w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-colors',
        error
          ? 'border-red-300 focus:ring-red-200'
          : 'border-gray-300 dark:border-gray-600',
        className
      )}
      {...props}
    />
  );
}

// ============================================
// TAGS INPUT COMPONENT
// ============================================

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagsInput({ value, onChange, placeholder, maxTags = 10, className }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800 border rounded-lg',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
        'border-gray-300 dark:border-gray-600',
        className
      )}
      onClick={() => document.getElementById('tags-input')?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-primary-900 focus:outline-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        id="tags-input"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

// ============================================
// PHONE INPUT COMPONENT
// ============================================

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function PhoneInput({ error, className, ...props }: PhoneInputProps) {
  const formatPhone = (value: string) => {
    // Remove all non-numeric characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Add India country code if starts with just a number
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+91' + cleaned;
    }
    
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (props.onChange) {
      Object.defineProperty(e.target, 'value', {
        writable: true,
        value: formatted,
      });
      props.onChange(e);
    }
  };

  return (
    <input
      type="tel"
      placeholder="+91 98765 43210"
      className={cn(
        'w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'transition-colors',
        error
          ? 'border-red-300 focus:ring-red-200'
          : 'border-gray-300 dark:border-gray-600',
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

// ============================================
// FORM ERROR SUMMARY
// ============================================

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  return (
    <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="w-5 h-5" />
        <h4 className="font-medium">Please fix {errorCount} error{errorCount > 1 ? 's' : ''}</h4>
      </div>
      <ul className="mt-2 space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field} className="text-sm text-red-600">
            • <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
}