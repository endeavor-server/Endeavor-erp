// Login Page - Self-contained with inline styles for guaranteed rendering

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';
import { env } from '../../config/env';

const MOCK_CREDENTIALS: Record<string, { password: string; role: UserRole; label: string; color: string }> = {
  'admin@endeavor.in': { password: 'admin123', role: 'admin', label: 'Super Admin', color: '#8B5CF6' },
  'ops@endeavor.in': { password: 'ops123', role: 'endeavor_ops', label: 'Operations', color: '#3B82F6' },
  'client@acme.com': { password: 'client123', role: 'client', label: 'Client', color: '#10B981' },
  'freelancer@dev.com': { password: 'freelancer123', role: 'freelancer', label: 'Freelancer', color: '#F59E0B' },
  'contractor@build.com': { password: 'contractor123', role: 'contractor', label: 'Contractor', color: '#EC4899' },
  'vendor@supply.com': { password: 'vendor123', role: 'vendor', label: 'Vendor', color: '#14B8A6' },
};

// SVG Icons as components
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M12 6h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M8 6h.01"/><path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/><rect width="16" height="20" x="4" y="2" rx="2"/></svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const SpinnerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate loading check
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login({ email, password, rememberMe });

    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(MOCK_CREDENTIALS[demoEmail].password);
    setError(null);
    setIsSubmitting(true);

    const result = await login({ 
      email: demoEmail, 
      password: MOCK_CREDENTIALS[demoEmail].password,
      rememberMe: true 
    });

    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(59, 130, 246, 0.3)',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ color: 'white' }}><BuildingIcon /></div>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px'
          }}>
            Endeavor SUPER CRM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Enterprise Business Operating System
          </p>
          {env.VITE_ENABLE_MOCK_AUTH && (
            <span style={{
              display: 'inline-block',
              marginTop: '12px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#F59E0B'
            }}>
              Demo Mode
            </span>
          )}
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}>
                  <MailIcon />
                </div>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid #475569',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#475569';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}>
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid #475569',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#475569';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid #475569',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    accentColor: '#3B82F6'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Remember me</span>
              </label>
              <button
                type="button"
                style={{
                  fontSize: '14px',
                  color: '#3B82F6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#EF4444', flexShrink: 0 }}><AlertCircleIcon /></div>
                <span style={{ fontSize: '14px', color: '#FCA5A5' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              style={{
                width: '100%',
                padding: '14px',
                background: isSubmitting || !email || !password
                  ? 'rgba(59, 130, 246, 0.5)'
                  : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '12px',
                cursor: isSubmitting || !email || !password ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            {showDemoAccounts ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>

          {showDemoAccounts && (
            <div style={{ marginTop: '16px' }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                Click any account to auto-login
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(MOCK_CREDENTIALS).map(([demoEmail, creds]) => (
                  <button
                    key={demoEmail}
                    onClick={() => handleDemoLogin(demoEmail)}
                    disabled={isSubmitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '12px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      opacity: isSubmitting ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.8)';
                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                      e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.6)';
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: creds.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {creds.label.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#e2e8f0',
                        marginBottom: '2px'
                      }}>
                        {creds.label}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {demoEmail}
                      </p>
                    </div>
                    <code style={{
                      fontSize: '11px',
                      color: '#475569',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontFamily: 'monospace'
                    }}>
                      {creds.password}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#475569',
          marginTop: '32px'
        }}>
          © 2025 Endeavor Academy Pvt Ltd. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
