// Login Page
// Production-grade authentication form with demo accounts

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { env } from '../../config/env';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Building2
} from 'lucide-react';

const MOCK_CREDENTIALS: Record<string, { password: string; role: UserRole; label: string; color: string }> = {
  'admin@endeavor.in': { password: 'admin123', role: 'admin', label: 'Super Admin', color: 'bg-purple-500' },
  'ops@endeavor.in': { password: 'ops123', role: 'endeavor_ops', label: 'Operations', color: 'bg-blue-500' },
  'client@acme.com': { password: 'client123', role: 'client', label: 'Client', color: 'bg-green-500' },
  'freelancer@dev.com': { password: 'freelancer123', role: 'freelancer', label: 'Freelancer', color: 'bg-orange-500' },
  'contractor@build.com': { password: 'contractor123', role: 'contractor', label: 'Contractor', color: 'bg-yellow-500' },
  'vendor@supply.com': { password: 'vendor123', role: 'vendor', label: 'Vendor', color: 'bg-pink-500' },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error: authError, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login({ email, password, rememberMe });

    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
      emailInputRef.current?.focus();
    } else {
      // Login successful - will redirect via useEffect
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20 mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Endeavor SUPER CRM
          </h1>
          <p className="text-slate-400">
            Enterprise Business Operating System
          </p>
          {env.VITE_ENABLE_MOCK_AUTH && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 mt-3">
              Demo Mode Enabled
            </span>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Display */}
            {(error || authError) && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error || authError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6">
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
          >
            {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDemoAccounts && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500 text-center mb-3">
                Click any account to auto-login
              </p>
              {Object.entries(MOCK_CREDENTIALS).map(([demoEmail, creds]) => (
                <button
                  key={demoEmail}
                  onClick={() => handleDemoLogin(demoEmail)}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 hover:bg-slate-800 transition-all text-left group"
                >
                  <div className={`w-10 h-10 rounded-lg ${creds.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {creds.label.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white">{creds.label}</p>
                    <p className="text-xs text-slate-500 truncate">{demoEmail}</p>
                  </div>
                  <div className="text-xs text-slate-600 font-mono bg-slate-900 px-2 py-1 rounded">
                    {creds.password}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          © 2025 Endeavor Academy Pvt Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
