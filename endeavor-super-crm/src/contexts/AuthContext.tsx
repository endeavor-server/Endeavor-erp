import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { parseSupabaseError } from '../utils/dataIntegrity';
import type {
  User,
  UserRole,
  LoginCredentials,
  AuthState,
  Permission,
  AuthAuditLog,
} from '../types/auth';
import { ROLE_PERMISSIONS, MODULE_ACCESS } from '../types/auth';

// ============================================
// AUTH CONTEXT TYPE
// ============================================

interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessModule: (module: string) => boolean;

  // Role checks
  isAdmin: () => boolean;
  isOps: () => boolean;
  isExternal: () => boolean;

  // Data filtering helpers
  getDataScope: () => 'own' | 'organization' | 'all';

  // Loading state
  isRefreshing: boolean;
}

// ============================================
// AUTH CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// MAP SUPABASE USER TO APP USER
// ============================================

function mapSupabaseUser(userData: {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
    organization_id?: string;
  };
}): User {
  return {
    id: userData.id,
    email: userData.email || '',
    firstName: userData.user_metadata?.first_name || '',
    lastName: userData.user_metadata?.last_name || '',
    role: (userData.user_metadata?.role as UserRole) || 'freelancer',
    organizationId: userData.user_metadata?.organization_id,
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// AUDIT LOG HELPER
// ============================================

async function logAuthEvent(
  log: Omit<AuthAuditLog, 'id' | 'timestamp'>
): Promise<void> {
  const entry: AuthAuditLog = {
    ...log,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Store to Supabase audit_logs table if available
    await supabase.from('audit_logs').insert({
      user_id: log.userId,
      action: log.action,
      entity_type: 'auth',
      entity_id: log.userId,
      old_data: { email: log.email, success: log.success },
      new_data: log.details,
    });
  } catch {
    // Silent fail - audit logging shouldn't break auth
    console.warn('[AUTH AUDIT - Local]', entry);
  }
}

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

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

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
          // Fetch extended user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profile?.first_name || session.user.user_metadata?.first_name || '',
            lastName: profile?.last_name || session.user.user_metadata?.last_name || '',
            avatar: profile?.avatar_url,
            role: profile?.role || session.user.user_metadata?.role || 'freelancer',
            organizationId: profile?.organization_id,
            isActive: profile?.is_active !== false,
            mfaEnabled: false,
            lastLoginAt: profile?.last_login_at || new Date().toISOString(),
            createdAt: session.user.created_at || new Date().toISOString(),
            updatedAt: profile?.updated_at || new Date().toISOString(),
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

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch extended profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: profile?.first_name || session.user.user_metadata?.first_name || '',
          lastName: profile?.last_name || session.user.user_metadata?.last_name || '',
          avatar: profile?.avatar_url,
          role: profile?.role || session.user.user_metadata?.role || 'freelancer',
          organizationId: profile?.organization_id,
          isActive: profile?.is_active !== false,
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
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } else if (event === 'TOKEN_REFRESHED') {
        // Session refreshed - no action needed
        console.log('Token refreshed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          const parsedError = parseSupabaseError(error as unknown as { code: string; message: string; details?: string });
          const message = parsedError?.message || 'Invalid email or password';

          await logAuthEvent({
            userId: 'unknown',
            email: credentials.email,
            action: 'login_failed',
            success: false,
            details: { reason: error.code, message: error.message },
          });

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

        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);

        await logAuthEvent({
          userId: data.user.id,
          email: credentials.email,
          action: 'login',
          success: true,
        });

        // The user will be set by the onAuthStateChange listener
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';

        await logAuthEvent({
          userId: 'unknown',
          email: credentials.email,
          action: 'login_failed',
          success: false,
          details: { reason: 'system_error', error: errorMessage },
        });

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    const user = state.user;

    if (user) {
      await logAuthEvent({
        userId: user.id,
        email: user.email,
        action: 'logout',
        success: true,
      });
    }

    await supabase.auth.signOut();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [state.user]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) return false;

    setIsRefreshing(true);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error || !session) {
        console.error('Token refresh failed:', error);

        await logAuthEvent({
          userId: state.user?.id || 'unknown',
          email: state.user?.email || 'unknown',
          action: 'login_failed',
          success: false,
          details: { reason: 'token_refresh_failed' },
        });

        setIsRefreshing(false);
        return false;
      }

      await logAuthEvent({
        userId: session.user.id,
        email: session.user.email || '',
        action: 'login',
        success: true,
      });

      setIsRefreshing(false);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);

      await logAuthEvent({
        userId: state.user?.id || 'unknown',
        email: state.user?.email || 'unknown',
        action: 'login_failed',
        success: false,
      });

      setIsRefreshing(false);
      return false;
    }
  }, [isRefreshing, state.user]);

  // Reset password
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Password reset failed',
        };
      }
    },
    []
  );

  // Update password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Password update failed',
        };
      }
    },
    []
  );

  // Permission checks
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!state.user) return false;
      const userPermissions = ROLE_PERMISSIONS[state.user.role];
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

  // Role checks
  const isAdmin = useCallback((): boolean => {
    return state.user?.role === 'admin';
  }, [state.user]);

  const isOps = useCallback((): boolean => {
    return state.user?.role === 'endeavor_ops';
  }, [state.user]);

  const isExternal = useCallback((): boolean => {
    if (!state.user) return false;
      return ['client', 'freelancer', 'contractor', 'vendor'].includes(state.user.role);
  }, [state.user]);

  // Data scope
  const getDataScope = useCallback((): 'own' | 'organization' | 'all' => {
    if (!state.user) return 'own';

    if (state.user.role === 'admin') return 'all';
    if (state.user.role === 'endeavor_ops') return 'organization';
    return 'own';
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

// ============================================
// DATA ACCESS HOOK
// ============================================

export function useDataAccess() {
  const { user, getDataScope, canAccessModule } = useAuth();

  const filterByAccess = useCallback(
    <T extends { userId?: string; organizationId?: string; created_at?: string }>(data: T[]): T[] => {
      const scope = getDataScope();

      if (scope === 'all') return data;
      if (scope === 'organization') {
        return data.filter((item) => item.organizationId === user?.organizationId);
      }
      return data.filter((item) => item.userId === user?.id);
    },
    [getDataScope, user]
  );

  const filterActiveRecords = useCallback(
    <T extends { is_active?: boolean; deleted_at?: string | null }>(data: T[]): T[] => {
      return data.filter((item) => item.is_active !== false && !item.deleted_at);
    },
    []
  );

  return {
    filterByAccess,
    filterActiveRecords,
    canAccessModule,
    getDataScope,
  };
}
