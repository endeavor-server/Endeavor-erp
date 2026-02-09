import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import type {
  User,
  UserRole,
  LoginCredentials,
  AuthState,
  Permission,
} from '../types/auth';
import { ROLE_PERMISSIONS, MODULE_ACCESS } from '../types/auth';

// ============================================
// MOCK AUTHENTICATION DATA
// ============================================

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@endeavor.in': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@endeavor.in',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      organizationId: 'org-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'ops@endeavor.in': {
    password: 'ops123',
    user: {
      id: '2',
      email: 'ops@endeavor.in',
      firstName: 'Ops',
      lastName: 'Manager',
      role: 'endeavor_ops',
      organizationId: 'org-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'client@acme.com': {
    password: 'client123',
    user: {
      id: '3',
      email: 'client@acme.com',
      firstName: 'Client',
      lastName: 'User',
      role: 'client',
      organizationId: 'org-client-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'freelancer@dev.com': {
    password: 'freelancer123',
    user: {
      id: '4',
      email: 'freelancer@dev.com',
      firstName: 'Freelance',
      lastName: 'Developer',
      role: 'freelancer',
      organizationId: 'org-fl-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'contractor@build.com': {
    password: 'contractor123',
    user: {
      id: '5',
      email: 'contractor@build.com',
      firstName: 'Contractor',
      lastName: 'Builder',
      role: 'contractor',
      organizationId: 'org-cont-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'vendor@supply.com': {
    password: 'vendor123',
    user: {
      id: '6',
      email: 'vendor@supply.com',
      firstName: 'Vendor',
      lastName: 'Supplier',
      role: 'vendor',
      organizationId: 'org-vend-1',
      isActive: true,
      mfaEnabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

// ============================================
// AUTH CONTEXT TYPE
// ============================================

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessModule: (module: string) => boolean;
  isAdmin: () => boolean;
  isOps: () => boolean;
  isExternal: () => boolean;
  getDataScope: () => 'own' | 'organization' | 'all';
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// USE AUTH HOOK
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMockAuth = env.VITE_ENABLE_MOCK_AUTH;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for mock session
        if (isMockAuth) {
          const mockSession = localStorage.getItem('mock_session');
          if (mockSession) {
            const user = JSON.parse(mockSession) as User;
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
          return;
        }

        // Real Supabase auth
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to restore session',
          });
          return;
        }

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            role: (session.user.user_metadata?.role as UserRole) || 'freelancer',
            organizationId: session.user.user_metadata?.organization_id,
            isActive: true,
            mfaEnabled: false,
            lastLoginAt: new Date().toISOString(),
            createdAt: session.user.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initAuth();
  }, [isMockAuth]);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Mock authentication
        if (isMockAuth) {
          const mockUser = MOCK_USERS[credentials.email.toLowerCase()];
          
          if (!mockUser || mockUser.password !== credentials.password) {
            const errorMsg = 'Invalid email or password';
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: errorMsg,
            }));
            return { success: false, error: errorMsg };
          }

          const user = { ...mockUser.user, lastLoginAt: new Date().toISOString() };
          localStorage.setItem('mock_session', JSON.stringify(user));

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        }

        // Real Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          const message = error.message || 'Invalid email or password';
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: message,
          }));
          return { success: false, error: message };
        }

        if (!data.user) {
          const errorMsg = 'User not found';
          setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
          return { success: false, error: errorMsg };
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          role: (data.user.user_metadata?.role as UserRole) || 'freelancer',
          organizationId: data.user.user_metadata?.organization_id,
          isActive: true,
          mfaEnabled: false,
          lastLoginAt: new Date().toISOString(),
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Login failed';
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    [isMockAuth]
  );

  // Logout function
  const logout = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (isMockAuth) {
        localStorage.removeItem('mock_session');
      } else {
        await supabase.auth.signOut();
      }
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isMockAuth]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      if (isMockAuth) {
        const mockSession = localStorage.getItem('mock_session');
        if (mockSession) {
          const user = JSON.parse(mockSession) as User;
          setState((prev) => ({ ...prev, user, isAuthenticated: true }));
          return true;
        }
        return false;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isMockAuth]);

  // Reset password (placeholder)
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      if (isMockAuth) {
        return { success: true };
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to send reset email' };
      }
    },
    [isMockAuth]
  );

  // Update password (placeholder)
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (isMockAuth) {
        return { success: true };
      }
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to update password' };
      }
    },
    [isMockAuth]
  );

  // Permission helpers
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!state.user) return false;
      const userPermissions = ROLE_PERMISSIONS[state.user.role] || [];
      return userPermissions.includes(permission);
    },
    [state.user]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  const canAccessModule = useCallback(
    (module: string): boolean => {
      if (!state.user) return false;
      const allowedRoles = MODULE_ACCESS[module] || [];
      return allowedRoles.includes(state.user.role);
    },
    [state.user]
  );

  // Role check helpers
  const isAdmin = useCallback(() => state.user?.role === 'admin', [state.user]);
  const isOps = useCallback(() => state.user?.role === 'endeavor_ops', [state.user]);
  const isExternal = useCallback(
    () => ['client', 'freelancer', 'contractor', 'vendor'].includes(state.user?.role || ''),
    [state.user]
  );

  // Data scope helper
  const getDataScope = useCallback((): 'own' | 'organization' | 'all' => {
    if (!state.user) return 'own';
    
    switch (state.user.role) {
      case 'admin':
      case 'endeavor_ops':
        return 'all';
      case 'client':
        return 'organization';
      default:
        return 'own';
    }
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
    resetPassword,
    updatePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isAdmin,
    isOps,
    isExternal,
    getDataScope,
    isRefreshing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
