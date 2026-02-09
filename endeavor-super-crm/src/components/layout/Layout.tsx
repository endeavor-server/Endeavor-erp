// Layout Component - App Shell Wrapper
// Provides consistent header, sidebar, and main content area

import { type ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { ModuleType } from '../../types';

export function Layout() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('command-center');

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Sidebar */}
      <Sidebar 
        currentModule={currentModule} 
        onModuleChange={setCurrentModule} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        <Header 
          title="Endeavor SUPER CRM" 
          subtitle="Enterprise Business Operating System" 
        />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
