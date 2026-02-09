// Endeavor SUPER CRM - Main Application Entry
// Production-grade React Router setup with Auth and RBAC

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/guards/ProtectedRoute';

// Auth Pages (keep eager loaded - critical path)
import Login from './pages/auth/Login';
import AccessDenied from './pages/auth/AccessDenied';

// Layout (keep eager loaded - critical path)
import { Layout } from './components/layout/Layout';

// Dashboard (keep eager loaded - landing page)
import Dashboard from './pages/Dashboard';

// Lazy-loaded Modules (code splitting for large components)
const CommandCenter = lazy(() => import('./modules/command-center/CommandCenter').then(m => ({ default: m.CommandCenter })));
const ClientsModule = lazy(() => import('./modules/clients/ClientsModule').then(m => ({ default: m.ClientsModule })));
const WorkDeliveryModule = lazy(() => import('./modules/work-delivery/WorkDeliveryModule').then(m => ({ default: m.WorkDeliveryModule })));
const PeopleModule = lazy(() => import('./modules/people/PeopleModule').then(m => ({ default: m.PeopleModule })));
const FinanceModule = lazy(() => import('./modules/finance/FinanceModule').then(m => ({ default: m.FinanceModule })));
const SalesModule = lazy(() => import('./modules/sales/SalesModule').then(m => ({ default: m.SalesModule })));
const AIAutomationModule = lazy(() => import('./modules/ai-automation/AIAutomationModule').then(m => ({ default: m.AIAutomationModule })));
const IntegrationsModule = lazy(() => import('./modules/integrations/IntegrationsModule').then(m => ({ default: m.IntegrationsModule })));
const ReportsModule = lazy(() => import('./modules/reports/ReportsModule').then(m => ({ default: m.ReportsModule })));
const AdminModule = lazy(() => import('./modules/admin/AdminModule').then(m => ({ default: m.AdminModule })));

// Lazy-loaded Finance Sub-pages (heavy components with PDF/Charts)
const ClientInvoices = lazy(() => import('./pages/invoicing/ClientInvoices'));
const InvoiceCenter = lazy(() => import('./pages/invoicing/InvoiceCenter'));

// Loading Fallback for Suspense
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        <p className="text-[var(--text-muted)] text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Error Pages
function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">404</h1>
        <p className="text-[var(--text-secondary)]">Page not found</p>
      </div>
    </div>
  );
}

// Root component that handles initial routing
function AppRoot() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      {/* Access Denied */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected Routes - Main Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard - All authenticated users */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Command Center - Admin & Ops only */}
          <Route path="/command-center" element={
            <ProtectedRoute module="command_center">
              <Suspense fallback={<PageLoader />}>
                <CommandCenter />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Clients - Admin, Ops, Clients (own data) */}
          <Route path="/clients" element={
            <ProtectedRoute module="clients">
              <Suspense fallback={<PageLoader />}>
                <ClientsModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Work & Delivery - All roles (filtered by permissions) */}
          <Route path="/work-delivery" element={
            <ProtectedRoute module="work_delivery">
              <Suspense fallback={<PageLoader />}>
                <WorkDeliveryModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Finance - Role-based access */}
          <Route path="/finance" element={
            <ProtectedRoute module="finance">
              <Suspense fallback={<PageLoader />}>
                <FinanceModule />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/invoicing/client-invoices" element={
            <ProtectedRoute module="finance">
              <Suspense fallback={<PageLoader />}>
                <ClientInvoices />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/invoicing/center" element={
            <ProtectedRoute module="finance">
              <Suspense fallback={<PageLoader />}>
                <InvoiceCenter />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Sales - Admin & Ops only */}
          <Route path="/sales" element={
            <ProtectedRoute module="sales">
              <Suspense fallback={<PageLoader />}>
                <SalesModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* AI Automation - Admin & Ops only */}
          <Route path="/ai-automation" element={
            <ProtectedRoute module="ai_automation">
              <Suspense fallback={<PageLoader />}>
                <AIAutomationModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Integrations - Admin & Ops only */}
          <Route path="/integrations" element={
            <ProtectedRoute module="integrations">
              <Suspense fallback={<PageLoader />}>
                <IntegrationsModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Reports - Admin, Ops, Clients (own reports) */}
          <Route path="/reports" element={
            <ProtectedRoute module="reports">
              <Suspense fallback={<PageLoader />}>
                <ReportsModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Admin - Admin only */}
          <Route path="/admin" element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminModule />
              </Suspense>
            </AdminRoute>
          } />

          {/* People - Admin, Ops, Vendors (own profile) */}
          <Route path="/people" element={
            <ProtectedRoute module="people">
              <Suspense fallback={<PageLoader />}>
                <PeopleModule />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
