// Minimal Working App with Proper Imports
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '24px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(71, 85, 105, 0.5)'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Dashboard</h1>
            <p style={{ color: '#94a3b8' }}>Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[
            { title: 'Total Users', value: '900+', color: '#3B82F6' },
            { title: 'Active Projects', value: '45', color: '#10B981' },
            { title: 'Invoices', value: '1,234', color: '#F59E0B' },
            { title: 'Revenue', value: '₹2.4Cr', color: '#8B5CF6' }
          ].map((card, i) => (
            <div key={i} style={{
              padding: '24px',
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(71, 85, 105, 0.5)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: card.color,
                marginBottom: '16px'
              }}></div>
              <p style={{ color: '#94a3b8', marginBottom: '8px' }}>{card.title}</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a'
      }}>
        <div style={{ 
          color: '#94a3b8',
          fontSize: '18px'
        }}>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;