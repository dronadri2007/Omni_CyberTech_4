import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 text-center font-mono">
      <div className="space-y-4 max-w-md">
        <ShieldAlert className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
        <h1 className="text-4xl font-extrabold text-slate-100">404 — PAGE NOT FOUND</h1>
        <p className="text-xs text-slate-400">The requested SOC routing node does not exist or has been archived.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> RETURN TO LANDING PAGE
        </Link>
      </div>
    </div>
  );
};
