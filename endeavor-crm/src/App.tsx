import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Leads } from './pages/Leads';
import { Deals } from './pages/Deals';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { initializeMockData } from './data/mockData';
import type { ViewType } from './types';

const viewTitles: Record<ViewType, { title: string; subtitle?: string }> = {
  dashboard: { 
    title: 'Dashboard', 
    subtitle: 'Overview of your sales performance' 
  },
  contacts: { 
    title: 'Contacts', 
    subtitle: 'Manage your contacts and customers' 
  },
  leads: { 
    title: 'Leads', 
    subtitle: 'Track and manage your sales leads' 
  },
  deals: { 
    title: 'Deals', 
    subtitle: 'Monitor your pipeline and opportunities' 
  },
  tasks: { 
    title: 'Tasks', 
    subtitle: 'Stay on top of your to-do list' 
  },
  calendar: { 
    title: 'Calendar', 
    subtitle: 'Schedule and manage your activities' 
  },
  reports: { 
    title: 'Reports', 
    subtitle: 'Analytics and performance insights' 
  },
};

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'leads':
        return <Leads />;
      case 'deals':
        return <Deals />;
      case 'tasks':
        return <Tasks />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <Header 
          title={viewTitles[currentView].title}
          subtitle={viewTitles[currentView].subtitle}
        />
        <main className="min-h-[calc(100vh-80px)]">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
