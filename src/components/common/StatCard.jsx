import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, subtext, icon: Icon, trend, trendValue, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/5 text-indigo-400 border-indigo-500/30 glow-indigo',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/30 glow-emerald',
    amber: 'from-amber-500/20 to-yellow-500/5 text-amber-400 border-amber-500/30 glow-amber',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/30 glow-rose',
    cyan: 'from-cyan-500/20 to-blue-500/5 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className={`glass-card p-5 rounded-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 border ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/90 border border-slate-700/50`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {(trend || trendValue) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 font-medium">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
            <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}>
              {trendValue}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">vs previous period</span>
        </div>
      )}
    </div>
  );
};
