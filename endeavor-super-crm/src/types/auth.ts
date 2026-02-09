// Authentication & Authorization Types
// Production-grade RBAC system for Endeavor SUPER CRM

export type UserRole = 
  | 'admin'           // Full access, super admin
  | 'endeavor_ops'    // Operations team - finance, HR, reporting
  | 'client'          // External client - limited to own data
  | 'freelancer'      // Freelancer - own profile, assignments, invoices
  | 'contractor'      // Contractor - own contracts, milestones, payments
  | 'vendor';         // Vendor - own POs, GRNs, payment status

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  organizationId?: string;  // For clients - which company they belong to
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // MFA fields
  mfaEnabled: boolean;
  mfaVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;  // Unix timestamp
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Permission matrix - what each role can do
export type Permission = 
  // Module access
  | 'module:command_center:read'
  | 'module:clients:read' | 'module:clients:write' | 'module:clients:delete'
  | 'module:work_delivery:read' | 'module:work_delivery:write'
  | 'module:people:read' | 'module:people:write' | 'module:people:delete'
  | 'module:finance:read' | 'module:finance:write' | 'module:finance:approve'
  | 'module:sales:read' | 'module:sales:write'
  | 'module:ai_automation:read' | 'module:ai_automation:write'
  | 'module:integrations:read' | 'module:integrations:write'
  | 'module:reports:read' | 'module:reports:write'
  | 'module:admin:read' | 'module:admin:write'
  // Data access
  | 'data:own:read' | 'data:own:write'
  | 'data:organization:read' | 'data:organization:write'
  | 'data:all:read' | 'data:all:write'
  // Actions
  | 'action:approve:invoice'
  | 'action:approve:payment'
  | 'action:manage:users'
  | 'action:view:audit_logs'
  | 'action:export:data'
  | 'action:delete:data';

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full system access
    'module:command_center:read',
    'module:clients:read', 'module:clients:write', 'module:clients:delete',
    'module:work_delivery:read', 'module:work_delivery:write',
    'module:people:read', 'module:people:write', 'module:people:delete',
    'module:finance:read', 'module:finance:write', 'module:finance:approve',
    'module:sales:read', 'module:sales:write',
    'module:ai_automation:read', 'module:ai_automation:write',
    'module:integrations:read', 'module:integrations:write',
    'module:reports:read', 'module:reports:write',
    'module:admin:read', 'module:admin:write',
    'data:all:read', 'data:all:write',
    'action:approve:invoice', 'action:approve:payment',
    'action:manage:users', 'action:view:audit_logs',
    'action:export:data', 'action:delete:data',
  ],
  
  endeavor_ops: [
    // Operations team - finance, HR, reporting
    'module:command_center:read',
    'module:clients:read', 'module:clients:write',
    'module:work_delivery:read', 'module:work_delivery:write',
    'module:people:read', 'module:people:write',
    'module:finance:read', 'module:finance:write', 'module:finance:approve',
    'module:sales:read', 'module:sales:write',
    'module:ai_automation:read',
    'module:integrations:read',
    'module:reports:read', 'module:reports:write',
    'data:organization:read', 'data:organization:write',
    'action:approve:invoice', 'action:approve:payment',
    'action:export:data',
  ],
  
  client: [
    // External client - only their own data
    'module:work_delivery:read',
    'module:finance:read',  // Only their invoices
    'module:reports:read',  // Only their reports
    'data:own:read', 'data:own:write',
    'action:export:data',
  ],
  
  freelancer: [
    // Freelancer - own profile, assignments, invoices
    'module:work_delivery:read',  // Only their assignments
    'module:finance:read',  // Only their invoices
    'data:own:read', 'data:own:write',
  ],
  
  contractor: [
    // Contractor - own contracts, milestones, payments
    'module:work_delivery:read',  // Only their milestones
    'module:finance:read',  // Only their payments
    'data:own:read', 'data:own:write',
  ],
  
  vendor: [
    // Vendor - own POs, GRNs, payment status
    'module:people:read',  // Only their vendor profile
    'module:finance:read',  // Only their POs and payments
    'data:own:read',
  ],
};

// Module access mapping - which roles can access each module
export const MODULE_ACCESS: Record<string, UserRole[]> = {
  'command_center': ['admin', 'endeavor_ops'],
  'clients': ['admin', 'endeavor_ops', 'client'],
  'work_delivery': ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor'],
  'people': ['admin', 'endeavor_ops', 'vendor'],
  'finance': ['admin', 'endeavor_ops', 'client', 'freelancer', 'contractor', 'vendor'],
  'sales': ['admin', 'endeavor_ops'],
  'ai_automation': ['admin', 'endeavor_ops'],
  'integrations': ['admin', 'endeavor_ops'],
  'reports': ['admin', 'endeavor_ops', 'client'],
  'admin': ['admin'],
};

// Audit log entry for auth events
export interface AuthAuditLog {
  id: string;
  userId: string;
  email: string;
  action: 'login' | 'logout' | 'login_failed' | 'token_refresh' | 'password_reset' | 'mfa_verified' | 'permission_denied';
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
}

// JWT payload structure
export interface JWTPayload {
  sub: string;        // User ID
  email: string;
  role: UserRole;
  orgId?: string;
  iat: number;        // Issued at
  exp: number;        // Expires at
  jti: string;        // JWT ID (for token revocation)
}
