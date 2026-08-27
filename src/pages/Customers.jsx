import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TransactionModal } from '../components/common/TransactionModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { User, ShoppingBag, DollarSign, Calendar, ChevronRight, Award, Search } from 'lucide-react';

export const CustomersPage = () => {
  const { customerMetrics, loading } = useDatabase();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  if (loading) {
    return <LoadingSpinner label="Loading customer database..." />;
  }

  const filteredCustomers = customerMetrics.filter((cust) =>
    cust.customerID.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Unique Shoppers</p>
            <h3 className="text-2xl font-bold text-white mt-1">{customerMetrics.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Customer Spend</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(
                customerMetrics.length
                  ? customerMetrics.reduce((sum, c) => sum + c.totalSpent, 0) / customerMetrics.length
                  : 0
              )}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Spender Account</p>
            <h3 className="text-xl font-bold text-amber-400 mt-1 font-mono">
              {customerMetrics.length > 0 ? customerMetrics[0].customerID : 'N/A'}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Customers Layout: Search + List + Selected Customer History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Directory Table */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Customer Profiles</h2>
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Customer ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4 text-center">Purchases</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">View History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredCustomers.map((cust, idx) => (
                    <tr
                      key={cust.customerID}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition ${
                        selectedCustomer?.customerID === cust.customerID ? 'bg-slate-800/80' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 flex items-center space-x-2">
                        {idx === 0 && <Award className="w-4 h-4 text-amber-400" title="Top Spender" />}
                        <span>{cust.customerID}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold">{cust.purchaseCount}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {formatCurrency(cust.totalSpent)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDate(cust.lastPurchaseTimestamp)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1 rounded-lg hover:bg-indigo-600 text-slate-400 hover:text-white transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No Customers Found" message="No customer IDs match your search query." />
          )}
        </div>

        {/* Selected Customer Detailed Purchase History */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4">Customer Activity Log</h2>

            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white font-mono">{selectedCustomer.customerID}</h3>
                      <p className="text-[11px] text-slate-400">Customer Lifetime Stats</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400">Purchases:</span>
                      <p className="font-bold text-white">{selectedCustomer.purchaseCount}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Spent:</span>
                      <p className="font-bold text-emerald-400">{formatCurrency(selectedCustomer.totalSpent)}</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction History</h4>

                <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
                  {selectedCustomer.history.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-400">{tx.transactionId || tx.id}</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(tx.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Trolley: {tx.trolleyID || 'TR-01'}</span>
                        <span>{formatDate(tx.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                <User className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p>Select a customer from the left directory to view complete purchase timeline.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Transaction Modal */}
      {selectedTx && (
        <TransactionModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

    </div>
  );
};
