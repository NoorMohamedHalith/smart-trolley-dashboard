import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { FirebaseSettingsModal } from './FirebaseSettingsModal';
import { Wifi, WifiOff, Database, DatabaseBackup, CheckCircle2, AlertTriangle, RefreshCw, Settings } from 'lucide-react';

export const ConnectionStatus = () => {
  const { isConnected, isUsingFallback, seedFirebaseDatabase, isFirebaseConfigured } = useDatabase();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState(null);
  const [seedError, setSeedError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      const res = await seedFirebaseDatabase();
      setSeedMessage(res.message);
    } catch (err) {
      setSeedError(err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <div className="w-full bg-slate-900/80 border-b border-slate-800 px-4 py-2 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Wifi className="w-4 h-4" />
                <span>Realtime Firebase Connected</span>
              </div>
            ) : isUsingFallback ? (
              <div className="flex items-center space-x-2 text-amber-400 font-medium">
                <DatabaseBackup className="w-4 h-4 animate-pulse" />
                <span>Preview Mode (Click Settings to connect your real Firebase)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-rose-400 font-medium">
                <WifiOff className="w-4 h-4" />
                <span>Firebase Disconnected</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {seedMessage && (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {seedMessage}
              </span>
            )}
            {seedError && (
              <span className="text-rose-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {seedError}
              </span>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
              title="Configure real Firebase credentials"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>Firebase Config</span>
            </button>

            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-xs font-medium transition disabled:opacity-50 shadow-sm"
              title="Populate test transactions & trolleys into your Firebase Realtime Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding Firebase...' : 'Seed Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {showSettingsModal && (
        <FirebaseSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
};
