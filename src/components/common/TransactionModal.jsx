import React from 'react';
import { X, ShoppingBag, User, Cpu, Calendar, CreditCard, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TransactionModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const productsList = transaction.products ? Object.entries(transaction.products) : [];
  const statusColor = {
    Completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Failed: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }[transaction.paymentStatus] || 'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Transaction Details</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                  {transaction.paymentStatus || 'Completed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{transaction.transactionId || transaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Customer ID
              </span>
              <p className="font-semibold text-white font-mono">{transaction.customerID || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Trolley Hardware
              </span>
              <p className="font-semibold text-white font-mono">{transaction.trolleyID || 'TR-01'}</p>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date & Time
              </span>
              <p className="font-semibold text-white">{formatDate(transaction.timestamp)}</p>
            </div>

            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Total Amount
              </span>
              <p className="font-bold text-emerald-400 text-sm">{formatCurrency(transaction.total)}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-400" /> Scanned Items ({productsList.length})
            </h3>
            
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">Price</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-200">
                  {productsList.length > 0 ? (
                    productsList.map(([code, item]) => {
                      const price = Number(item.price || 0);
                      const qty = Number(item.quantity || 0);
                      const subtotal = price * qty;
                      return (
                        <tr key={code} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <p className="font-medium text-white">{item.name || code}</p>
                            <p className="text-[11px] text-slate-400 font-mono">Code: {code}</p>
                          </td>
                          <td className="py-3 px-4">{formatCurrency(price)}</td>
                          <td className="py-3 px-4 text-center font-semibold">{qty}</td>
                          <td className="py-3 px-4 text-right font-medium text-emerald-400">
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">
                        No product items recorded in this transaction.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300 font-medium text-sm">Grand Total Paid</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(transaction.total)}
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
