import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TransactionModal } from '../components/common/TransactionModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Search, Filter, ArrowUpDown, Eye, Receipt, Calendar, CreditCard } from 'lucide-react';

export const TransactionsPage = ({ searchQuery: externalSearchQuery }) => {
  const { purchases, loading } = useDatabase();

  const [search, setSearch] = useState(externalSearchQuery || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST or OLDEST
  const [selectedTx, setSelectedTx] = useState(null);

  // Synchronize search if header search query changes
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearch(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const filteredTransactions = useMemo(() => {
    return purchases.filter((tx) => {
      const txId = (tx.transactionId || tx.id || '').toLowerCase();
      const custId = (tx.customerID || '').toLowerCase();
      const trolleyId = (tx.trolleyID || '').toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch = !query || txId.includes(query) || custId.includes(query) || trolleyId.includes(query);

      const matchesStatus = statusFilter === 'ALL' || (tx.paymentStatus || 'Completed').toUpperCase() === statusFilter;

      // Date Filtering
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const txTime = new Date(tx.timestamp).getTime();
        const now = Date.now();
        if (dateFilter === 'TODAY') {
          const startOfDay = new Date().setHours(0, 0, 0, 0);
          matchesDate = txTime >= startOfDay;
        } else if (dateFilter === '7DAYS') {
          matchesDate = txTime >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === '30DAYS') {
          matchesDate = txTime >= now - 30 * 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
  }, [purchases, search, statusFilter, dateFilter, sortOrder]);

  if (loading) {
    return <LoadingSpinner label="Loading transaction database..." />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header Controls & Filters */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Transaction ID or Customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="7DAYS">Last 7 Days</option>
                <option value="30DAYS">Last 30 Days</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="flex items-center space-x-1.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 font-medium transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sort: {sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <span>Showing <strong className="text-white">{filteredTransactions.length}</strong> of {purchases.length} total transactions</span>
          {search && <span>Filtering by: "{search}"</span>}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Trolley ID</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTransactions.map((tx) => {
                  const itemCount = tx.products ? Object.values(tx.products).reduce((sum, p) => sum + Number(p.quantity || 0), 0) : 0;
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 flex items-center space-x-2">
                        <Receipt className="w-4 h-4 text-slate-500" />
                        <span>{tx.transactionId || tx.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">{tx.customerID || 'GUEST'}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400">{tx.trolleyID || 'TR-01'}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 text-sm">
                        {formatCurrency(tx.total)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{itemCount} items</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {tx.paymentStatus || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.timestamp)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No Matching Transactions" 
            message="No transaction records match your search or active filter settings." 
          />
        )}
      </div>

      {/* Receipt Modal */}
      {selectedTx && (
        <TransactionModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

    </div>
  );
};
