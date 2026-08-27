import React, { useState, useEffect } from 'react';
import { Menu, Search, Clock, Bell, RefreshCw } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Header = ({ activeTab, onOpenMobileSidebar, searchQuery, setSearchQuery }) => {
  const { anomalies, lowStockProducts } = useDatabase();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAlerts = (anomalies?.length || 0) + (lowStockProducts?.length || 0);

  const titleMap = {
    overview: 'Dashboard Overview',
    transactions: 'Transaction Management',
    customers: 'Customer Intelligence',
    products: 'Product & Inventory Performance',
    analytics: 'Sales & Revenue Analytics',
    trolleys: 'Trolley Fleet Monitoring',
    alerts: 'Security & Inventory Alerts',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {titleMap[activeTab] || 'Supermarket Dashboard'}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-time RFID Trolley Billing & Supermarket Telemetry
            </p>
          </div>
        </div>

        {/* Center: Quick Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Customer ID, Transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Right Side: Live Clock & Notification Badge */}
        <div className="flex items-center space-x-4">
          
          {/* Clock Widget */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          {/* Alert Notification Button */}
          <div className="relative">
            <button className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition">
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
