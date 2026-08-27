import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Cpu, 
  AlertTriangle, 
  Radio, 
  X,
  PanelLeftClose
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { anomalies, lowStockProducts } = useDatabase();
  const totalAlerts = (anomalies?.length || 0) + (lowStockProducts?.length || 0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'trolleys', label: 'Trolleys', icon: Cpu },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: AlertTriangle,
      badge: totalAlerts > 0 ? totalAlerts : null,
      badgeColor: 'bg-rose-500 text-white'
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand Header & Close Button */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg glow-indigo">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-white tracking-wide text-sm leading-tight">SMART TROLLEY</h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">RFID Management</p>
              </div>
            </div>

            {/* Close Sidebar Button (Visible on both Desktop & Mobile) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-800 transition duration-200"
              title="Close Sidebar Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md glow-indigo' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-indigo-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Hardware Status Footer Info */}
        <div className="p-4 m-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
          <p className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mb-2">Hardware Node Setup</p>
          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">MCU:</span>
              <span className="text-indigo-400 font-medium">ESP8266 NodeMCU</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reader:</span>
              <span className="text-emerald-400 font-medium">MFRC522 RFID</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Display:</span>
              <span className="text-amber-400 font-medium">16x2 I2C LCD</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
