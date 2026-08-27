import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { ShoppingBag, TrendingUp, AlertTriangle, Search, PackageCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ProductsPage = () => {
  const { productMetrics, inventory, loading } = useDatabase();
  const [search, setSearch] = useState('');

  if (loading) {
    return <LoadingSpinner label="Loading product performance metrics..." />;
  }

  const filteredProducts = productMetrics.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  const topSellers = productMetrics.slice(0, 5);

  const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

  return (
    <div className="space-y-6">
      
      {/* Product Revenue & Quantity Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Product Sales Distribution</h2>
            <p className="text-xs text-slate-400">Total units sold per RFID product item</p>
          </div>

          <div className="h-64 w-full">
            {productMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="totalQtySold" radius={[6, 6, 0, 0]}>
                    {topSellers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                No product sales data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Highlights */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top Selling Leaderboard
          </h2>

          <div className="space-y-3">
            {topSellers.map((prod, idx) => (
              <div key={prod.code} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{prod.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Code: {prod.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">{formatCurrency(prod.totalRevenue)}</span>
                  <span className="text-[11px] text-slate-400">{prod.totalQtySold} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Complete Product Performance Table */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Itemized Sales Directory</h2>
            <p className="text-xs text-slate-400">Detailed breakdown of RFID product tags</p>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search product name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4 text-center">Quantity Sold</th>
                  <th className="py-3 px-4 text-center">Transactions</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredProducts.map((prod) => (
                  <tr key={prod.code} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{prod.code}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{prod.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{formatCurrency(prod.price)}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">{prod.totalQtySold}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">{prod.transactionCount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(prod.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Products Match" message="No product records match your search criteria." />
        )}
      </div>

    </div>
  );
};
