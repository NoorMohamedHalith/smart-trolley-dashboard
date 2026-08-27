import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ConnectionStatus } from '../common/ConnectionStatus';

export const Layout = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, children }) => {
  // Start open by default, can be toggled/closed on all screen sizes
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Real-time Connection Status Banner */}
      <ConnectionStatus />

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />

        {/* Main Content Area (Dynamic padding based on Sidebar open/close state) */}
        <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}>
          <Header 
            activeTab={activeTab} 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
