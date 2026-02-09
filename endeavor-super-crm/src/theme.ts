// ============================================
// FUTURE-PROOF DESIGN TOKENS
// ============================================

export const tokens = {
  color: {
    // Backgrounds
    bg: '#0E1117',
    surface: '#161B22',
    'surface-hover': '#1C2128',
    'surface-active': '#21262D',
    
    // Borders
    border: '#2A2F3A',
    'border-hover': '#3B4250',
    
    // Brand
    primary: '#3B82F6',
    'primary-hover': '#2563EB',
    'primary-light': 'rgba(59, 130, 246, 0.1)',
    
    // Status
    success: '#22C55E',
    'success-light': 'rgba(34, 197, 94, 0.1)',
    warning: '#F59E0B',
    'warning-light': 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    'error-light': 'rgba(239, 68, 68, 0.1)',
    info: '#3B82F6',
    'info-light': 'rgba(59, 130, 246, 0.1)',
    
    // Text
    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
      muted: '#6B7280',
      disabled: '#4B5563',
    },
  },
  
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
    size: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  
  transition: {
    fast: '120ms ease',
    base: '180ms ease',
    slow: '300ms ease',
  },
} as const;

// ============================================
// DENSITY MODES
// ============================================

export type Density = 'comfort' | 'compact' | 'dense';

export const densityConfig = {
  comfort: {
    padding: {
      table: '16px',
      card: '24px',
      button: '12px 20px',
      input: '12px 16px',
    },
    gap: '24px',
    fontSize: '14px',
  },
  compact: {
    padding: {
      table: '12px',
      card: '16px',
      button: '8px 16px',
      input: '10px 14px',
    },
    gap: '16px',
    fontSize: '13px',
  },
  dense: {
    padding: {
      table: '8px',
      card: '12px',
      button: '6px 12px',
      input: '8px 12px',
    },
    gap: '12px',
    fontSize: '12px',
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getDensityClass = (density: Density, element: keyof typeof densityConfig['comfort']['padding']) => {
  const config = densityConfig[density];
  return config.padding[element];
};
