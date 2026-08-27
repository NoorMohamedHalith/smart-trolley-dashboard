import React, { useState } from 'react';
import { X, Database, Save, CheckCircle2, AlertTriangle, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { getActiveFirebaseConfig, saveCustomFirebaseConfig, clearCustomFirebaseConfig } from '../../firebase';

export const FirebaseSettingsModal = ({ onClose, onSaveSuccess }) => {
  const activeConfig = getActiveFirebaseConfig();

  const [apiKey, setApiKey] = useState(activeConfig.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState(activeConfig.databaseURL || '');
  const [projectId, setProjectId] = useState(activeConfig.projectId || '');
  const [authDomain, setAuthDomain] = useState(activeConfig.authDomain || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedSuccess(false);

    if (!databaseURL || !apiKey) {
      setErrorMsg('API Key and Database URL are required to connect to your real Firebase project.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim() || databaseURL.split('.')[0].replace('https://', ''),
      authDomain: authDomain.trim() || `${projectId || 'project'}.firebaseapp.com`,
      storageBucket: `${projectId || 'project'}.appspot.com`,
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:app',
    };

    try {
      saveCustomFirebaseConfig(config);
      setSavedSuccess(true);
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
        window.location.reload(); // Reload to initialize real Firebase listeners cleanly
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save configuration.');
    }
  };

  const handleResetDefaults = () => {
    clearCustomFirebaseConfig();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Real Firebase Project Configuration</h2>
              <p className="text-xs text-slate-400">Connect live Firebase Realtime Database for ESP8266</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
            Enter your real Firebase Realtime Database details below. Once saved, the dashboard connects directly to your live ESP8266 node purchases stream.
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Real Firebase settings saved! Initializing live connection...</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
              <span>Firebase Database URL *</span>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline text-[10px] flex items-center gap-1"
              >
                Open Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              required
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Web API Key *</label>
            <input
              type="text"
              required
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Project ID</label>
              <input
                type="text"
                placeholder="smart-trolley-123"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Auth Domain</label>
              <input
                type="text"
                placeholder="smart-trolley.firebaseapp.com"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-slate-200 text-xs underline"
            >
              Reset to Env Defaults
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg glow-indigo"
              >
                <Save className="w-4 h-4" />
                <span>Save & Connect Live</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
