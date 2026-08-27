import React from 'react';
import { Database, PlusCircle } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const EmptyState = ({ title = 'No Data Found', message = 'Firebase Database is currently empty or no records match your query.', showSeedButton = true }) => {
  const { seedFirebaseDatabase } = useDatabase();

  return (
    <div className="glass-card p-10 rounded-2xl flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 border border-slate-800">
      <div className="p-4 rounded-full bg-slate-800/80 text-indigo-400 border border-slate-700/60 mb-4">
        <Database className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{message}</p>
      
      {showSeedButton && (
        <button
          onClick={seedFirebaseDatabase}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow-lg glow-indigo"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Seed Firebase Database</span>
        </button>
      )}
    </div>
  );
};
