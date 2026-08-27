import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { StatCard } from '../components/common/StatCard';
import { TransactionModal } from '../components/common/TransactionModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { IndianRupee, Users, ShoppingBag, Receipt, Cpu, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const OverviewPage = ({ onNavigate }) => {
  const {
    todaySales,
    totalSales,
    totalCustomers,
    totalItemsSold,
    totalTransactions,
    activeTrolleysCount,
    purchases,
    anomalies,
    analyticsData,
    loading,
  } = useDatabase();

  const [selectedTx, setSelectedTx] = useState(null);

  if (loading) {
    return <LoadingSpinner label="Connecting to Firebase Realtime Database..." />;
  }

  const recentTransactions = [...purchases]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(todaySales)}
          subtext={`Total revenue: ${formatCurrency(totalSales)}`}
          icon={IndianRupee}
          color="emerald"
          trend="up"
          trendValue="+14.2%"
        />
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtext="Unique shopper IDs"
          icon={Users}
          color="indigo"
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Items Sold"
          value={totalItemsSold}
          subtext="RFID scanned items"
          icon={ShoppingBag}
          color="amber"
        />
        <StatCard
          title="Transactions"
          value={totalTransactions}
          subtext="Completed carts"
          icon={Receipt}
          color="cyan"
        />
        <StatCard
          title="Active Trolleys"
          value={`${activeTrolleysCount} Online`}
          subtext="ESP8266 Nodes Active"
          icon={Cpu}
          color="rose"
        />
      </div>

      {/* Revenue Chart & Anomalies Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Recharts Card */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Daily Revenue Flow</h2>
              <p className="text-xs text-slate-400">Real-time purchase trends over time</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="h-64 w-full">
            {analyticsData.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                No revenue trend data yet. Seed test data or perform purchases on ESP8266 trolley.
              </div>
            )}
          </div>
        </div>

        {/* Live Anomaly Alert Feed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white">Unusual Cart Activity</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                {anomalies.length} Alerts
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
              {anomalies.length > 0 ? (
                anomalies.slice(0, 3).map((anom) => (
                  <div key={anom.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-rose-400">{anom.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{anom.trolleyID}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{anom.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">
                  No unusual cart activity detected. System operating normally.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            View All Alerts
          </button>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-400">Live feed from Firebase `purchases/` node</p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Trolley ID</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400">{tx.transactionId || tx.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">{tx.customerID || 'GUEST'}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{tx.trolleyID || 'TR-01'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(tx.total)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {tx.paymentStatus || 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(tx.timestamp)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        title="View Full Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Recent Transactions" message="No purchase records currently found in Firebase." />
        )}
      </div>

      {/* Selected Transaction Modal */}
      {selectedTx && (
        <TransactionModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

    </div>
  );
};
