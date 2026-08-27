import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, Bell, User as UserIcon, Menu, X, ArrowRight, LogOut, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-extrabold text-xl tracking-wider bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 bg-clip-text text-transparent">
              VERIFRAME
            </span>
            <span className="text-[9px] font-mono tracking-widest text-blue-600 uppercase -mt-1 font-bold">
              AI SOC MEDIA VERIFICATION
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700 font-sans">
          <Link to="/" className={`hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600 font-bold' : ''}`}>
            Home
          </Link>
          <Link to="/analyze" className={`hover:text-blue-600 transition-colors ${location.pathname.startsWith('/analyze') ? 'text-blue-600 font-bold' : ''}`}>
            Analyze Media
          </Link>
          <Link to="/dashboard" className={`hover:text-blue-600 transition-colors ${location.pathname === '/dashboard' ? 'text-blue-600 font-bold' : ''}`}>
            Dashboard
          </Link>
          <Link to="/cases" className={`hover:text-blue-600 transition-colors ${location.pathname.startsWith('/cases') ? 'text-blue-600 font-bold' : ''}`}>
            Case History
          </Link>
          <Link to="/review" className={`hover:text-blue-600 transition-colors ${location.pathname === '/review' ? 'text-blue-600 font-bold' : ''}`}>
            Review Queue
          </Link>
          <Link to="/api-docs" className={`hover:text-blue-600 transition-colors ${location.pathname === '/api-docs' ? 'text-blue-600 font-bold' : ''}`}>
            API
          </Link>
          <Link to="/help" className={`hover:text-blue-600 transition-colors ${location.pathname === '/help' ? 'text-blue-600 font-bold' : ''}`}>
            Docs
          </Link>
        </nav>

        {/* Right Action buttons / User profile */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-mono text-xs font-bold tracking-wider hover:brightness-110 shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
          >
            ANALYZE MEDIA <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-blue-500/50 transition-all text-xs font-mono text-slate-800"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-700 font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="hidden lg:inline font-semibold">{user?.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 space-y-1 font-mono text-xs text-slate-700">
                  <div className="px-3 py-2 border-b border-slate-100 text-slate-500 text-[11px]">
                    Signed in as <span className="text-blue-600 font-bold">{user?.email}</span>
                  </div>
                  <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-2 hover:bg-slate-50 rounded text-slate-800 font-semibold">
                    Dashboard Overview
                  </Link>
                  <Link to="/settings" onClick={() => setUserDropdownOpen(false)} className="block px-3 py-2 hover:bg-slate-50 rounded text-slate-800 font-semibold">
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono">
              <Link to="/login" className="px-3 py-1.5 text-slate-700 hover:text-blue-600 transition-colors font-semibold">
                SIGN IN
              </Link>
              <Link to="/register" className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-bold">
                REGISTER
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-blue-600"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 font-mono text-sm shadow-xl">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            Home
          </Link>
          <Link to="/analyze" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-blue-600 font-bold">
            Analyze Media
          </Link>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            Dashboard
          </Link>
          <Link to="/cases" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            Case History
          </Link>
          <Link to="/review" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            Review Queue
          </Link>
          <Link to="/api-docs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            API Documentation
          </Link>
          <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">
            Settings
          </Link>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-white font-bold"
            >
              Start Analysis Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
