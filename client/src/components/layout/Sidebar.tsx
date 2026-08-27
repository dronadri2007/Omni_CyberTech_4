import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  History,
  FileCheck,
  UserCheck,
  Code2,
  Settings,
  HelpCircle,
  ShieldAlert,
  Activity
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Analyze Media', icon: Upload, path: '/analyze' },
    { label: 'Case History', icon: History, path: '/cases' },
    { label: 'Reports', icon: FileCheck, path: '/reports' },
    { label: 'Review Queue', icon: UserCheck, path: '/review' },
    { label: 'API & Integrations', icon: Code2, path: '/api-docs' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Documentation', icon: HelpCircle, path: '/help' },
  ];

  return (
    <aside className="w-64 bg-white/90 border-r border-slate-200/90 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="p-4 space-y-6">
        {/* SOC Status Badge */}
        <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold text-slate-900 uppercase">SOC SYSTEM</span>
              <span className="text-[9px] font-mono text-blue-700 font-bold">ACTIVE DETECTOR</span>
            </div>
          </div>
          <Activity className="w-4 h-4 text-blue-600" />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Model Engine Version Card Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-800 font-bold">
            <span>DETECTION ENGINE</span>
            <span className="text-blue-600">forensic-v1</span>
          </div>
          <p className="text-[10px] text-slate-500">ELA + EXIF + C2PA · model slot: pytorch</p>
        </div>
      </div>
    </aside>
  );
};
