import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Lock, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security' | 'privacy'>('account');

  return (
    <div className="space-y-6 py-4 font-mono">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          SYSTEM SETTINGS & PREFERENCES
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Configure your SOC workspace, security keys, and data retention policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Tabs */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'account' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" /> Account Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" /> Security & 2FA
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'privacy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" /> Data Retention
          </button>
        </div>

        {/* Right Content */}
        <div className="md:col-span-9 glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-6 text-xs font-mono shadow-sm">
          {activeTab === 'account' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">ACCOUNT DETAILS</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || 'Dr. Sarah Vance'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'sarah.vance@factcheck.org'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">NOTIFICATION ALERTS</h3>
              <div className="space-y-3 font-sans font-medium text-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" />
                  <span>Email alerts on High-Risk manipulation flags</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" />
                  <span>Human review queue updates</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">SECURITY & TWO-FACTOR AUTH</h3>
              <p className="text-slate-600 font-sans font-medium">Two-Factor Authentication is currently ENABLED via Hardware Key / TOTP.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">DATA PRIVACY & AUTOMATIC DELETION</h3>
              <p className="text-slate-600 font-sans font-medium">
                Uploaded media files are automatically sanitized and purged after 30 days unless pinned for evidence retention.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
