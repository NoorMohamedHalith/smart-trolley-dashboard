import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';
import { AlertTriangle, PackageX, Sliders, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export const AlertsPage = () => {
  const {
    anomalies,
    lowStockProducts,
    lowStockThreshold,
    setLowStockThreshold,
    inventory,
    loading,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState('ANOMALIES'); // 'ANOMALIES' or 'LOW_STOCK'

  if (loading) {
    return <LoadingSpinner label="Evaluating security and stock alerts..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header & Tab Switcher */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Alerts & Telemetry Security Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time rule engine for Unusual Cart Activity & Low Inventory Stock
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ANOMALIES')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'ANOMALIES' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Unusual Cart Activity ({anomalies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              activeTab === 'LOW_STOCK' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PackageX className="w-3.5 h-3.5" />
            <span>Low Stock Alerts ({lowStockProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Section 1: Unusual Cart Activity (Anomalies) */}
      {activeTab === 'ANOMALIES' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <p className="font-semibold text-slate-200 mb-1">Rule-Based Anomaly Detection Guidelines:</p>
            <p>
              Alerts flag structural patterns such as unusually high item counts (&gt;10 units), excessive cart totals (&gt;$300), rapid scan bursts, and frequent add/delete cycles. Flags are categorized as <strong className="text-rose-400">"Unusual Cart Activity"</strong> for staff verification.
            </p>
          </div>

          {anomalies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((anom) => {
                const severityStyle = {
                  HIGH: 'border-rose-500/40 bg-rose-500/10 text-rose-400 glow-rose',
                  MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-400 glow-amber',
                  LOW: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
                }[anom.severity] || 'border-slate-800 bg-slate-900';

                return (
                  <div key={anom.id} className={`glass-card p-5 rounded-2xl border ${severityStyle} space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <div>
                          <h3 className="font-bold text-white text-sm">{anom.title}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">TX: {anom.transactionId}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 border border-slate-800">
                        {anom.severity} SEVERITY
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      {anom.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/40">
                      <span className="flex items-center gap-1 font-mono text-cyan-400">
                        <Cpu className="w-3.5 h-3.5" /> {anom.trolleyID}
                      </span>
                      <span>{formatDate(anom.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 rounded-2xl text-center border border-slate-800 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Cart Anomalies Detected</h3>
              <p className="text-xs text-slate-400">All recent RFID transaction streams are within normal thresholds.</p>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Low Stock Alerts */}
      {activeTab === 'LOW_STOCK' && (
        <div className="space-y-6">
          
          {/* Threshold Config Control */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-white text-xs sm:text-sm">Configurable Low Stock Threshold</h3>
                <p className="text-[11px] text-slate-400">Trigger alert when product inventory falls below this limit</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300">Alert Threshold:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value) || 1)}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">units</span>
            </div>
          </div>

          {/* Low Stock Items Directory */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PackageX className="w-4 h-4 text-amber-400" />
              Products Below Stock Threshold ({lowStockProducts.length})
            </h3>

            {lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Product Code</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Alert Limit</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {lowStockProducts.map((prod) => (
                      <tr key={prod.code} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{prod.code}</td>
                        <td className="py-3 px-4 font-medium text-white">{prod.name}</td>
                        <td className="py-3 px-4 text-slate-400">{prod.category || 'General'}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-400 text-sm">
                          {prod.stock} units
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {prod.lowStockThreshold || lowStockThreshold}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            LOW STOCK
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                All inventory products have sufficient stock levels above {lowStockThreshold} units.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
