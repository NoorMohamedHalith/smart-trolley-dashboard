import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { Cpu, Wifi, WifiOff, User, Battery, ShoppingCart, Clock } from 'lucide-react';

export const TrolleysPage = () => {
  const { trolleys, loading } = useDatabase();

  if (loading) {
    return <LoadingSpinner label="Polling RFID Trolley hardware nodes..." />;
  }

  const onlineCount = trolleys.filter((t) => t.status === 'Online').length;
  const offlineCount = trolleys.filter((t) => t.status === 'Offline').length;

  return (
    <div className="space-y-6">
      
      {/* Fleet Overview Header */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Smart Trolley Fleet Telemetry</h2>
            <p className="text-xs text-slate-400">ESP8266 + MFRC522 RFID + 16x2 I2C LCD Node Fleet</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Wifi className="w-3.5 h-3.5" />
            <span>{onlineCount} Online</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <WifiOff className="w-3.5 h-3.5" />
            <span>{offlineCount} Offline</span>
          </div>
        </div>
      </div>

      {/* Trolleys Fleet Grid */}
      {trolleys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trolleys.map((trolley) => {
            const isOnline = trolley.status === 'Online';

            return (
              <div
                key={trolley.trolleyID || trolley.id}
                className={`glass-card p-5 rounded-2xl border transition-all duration-300 ${
                  isOnline 
                    ? 'border-emerald-500/30 glow-emerald' 
                    : 'border-slate-800 opacity-80'
                }`}
              >
                {/* Card Title & Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base font-mono">{trolley.trolleyID || trolley.id}</h3>
                      <p className="text-[11px] text-slate-400">Node MCU ESP8266</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 border ${
                    isOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span>{trolley.status || 'Offline'}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 pt-2 text-xs border-t border-slate-800/80">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> Active Shopper
                    </span>
                    <span className="font-mono font-semibold text-white">
                      {trolley.currentCustomerID || 'Unassigned / Idle'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Current Cart Items
                    </span>
                    <span className="font-bold text-white">
                      {trolley.activeItemCount ?? 0} items
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-cyan-400" /> Battery Level
                    </span>
                    <span className={`font-bold ${
                      (trolley.batteryLevel || 100) > 30 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {trolley.batteryLevel || 85}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Last Activity
                    </span>
                    <span className="text-slate-300 font-mono">
                      {formatRelativeTime(trolley.lastActivity)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex justify-between">
                  <span>OLED/LCD 16x2 Output: Active</span>
                  <span>MFRC522: SPI Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Trolleys Connected" message="No smart trolley hardware nodes found in Firebase `trolleys/`." />
      )}

    </div>
  );
};
