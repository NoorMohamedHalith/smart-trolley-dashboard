import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading Firebase data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    <span className="text-sm font-medium animate-pulse">{label}</span>
  </div>
);
