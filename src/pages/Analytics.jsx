import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatCard } from '../components/common/StatCard';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, TrendingUp, Users, DollarSign, Receipt, CreditCard } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPage = () => {
  const { analyticsData, totalSales, totalTransactions, totalCustomers, loading } = useDatabase();
  const [timeframe, setTimeframe] = useState('daily'); // 'daily' or 'monthly'

  if (loading) {
    return <LoadingSpinner label="Compiling analytics telemetry..." />;
  }

  const avgTransactionValue = totalTransactions ? totalSales / totalTransactions : 0;

  const chartData = timeframe === 'daily' ? analyticsData.daily : analyticsData.monthly;
  const xAxisKey = timeframe === 'daily' ? 'date' : 'month';

  return (
    <div className="space-y-6">
      
      {/* Timeframe selector header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">Sales & Shopper Telemetry</h2>
          <p className="text-xs text-slate-400">Aggregated revenue performance metrics</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              timeframe === 'daily' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              timeframe === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(totalSales)}
          subtext="Total processed cart sales"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Transactions"
          value={totalTransactions}
          subtext="RFID automated checkouts"
          icon={Receipt}
          color="indigo"
        />
        <StatCard
          title="Avg Transaction Value"
          value={formatCurrency(avgTransactionValue)}
          subtext="Basket size indicator"
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Total Unique Shoppers"
          value={totalCustomers}
          subtext="Identified customer IDs"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Chart 1: Revenue Flow (Area Chart) */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Revenue Trend Flow
            </h2>
            <p className="text-xs text-slate-400">Total monetary sales over selected period</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs">
              No sales chart data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid: Customer Volume & Average Basket Size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 2: Customer Count over time */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Customer Volume Trend
            </h2>
            <p className="text-xs text-slate-400">Unique customers per day</p>
          </div>

          <div className="h-60 w-full">
            {analyticsData.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Line type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                No customer volume data yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Average Transaction Value (ATV) */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Average Transaction Value (ATV)
            </h2>
            <p className="text-xs text-slate-400">Average spend per cart session</p>
          </div>

          <div className="h-60 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey={xAxisKey} stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Bar dataKey="avgTransactionValue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                No ATV data available.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
