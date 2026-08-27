import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (e: string, p: string) => {
    setFormError(null);
    try {
      await login(e, p);
      navigate('/dashboard');
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doLogin(email, password);
  };

  const handleDemoLogin = (role: 'analyst' | 'fact_checker') => {
    const demoEmail = role === 'fact_checker' ? 'sarah.vance@factcheck.org' : 'alex.mercer@cybersec.io';
    void doLogin(demoEmail, 'veriframe-demo');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 cyber-grid">
      <div className="w-full max-w-md glass-panel-glow p-8 rounded-2xl space-y-6 border border-blue-300 bg-white shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">VERIFRAME SOC SIGN IN</h2>
          <p className="text-xs text-slate-500 font-semibold">Access your security verification workspace</p>
        </div>

        {/* Demo Quick Logins Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-mono text-blue-700 font-bold block text-center">⚡ DEMO 1-CLICK LOGIN</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('analyst')}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 font-bold hover:border-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" /> SOC Analyst
            </button>
            <button
              onClick={() => handleDemoLogin('fact_checker')}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 font-bold hover:border-indigo-500 hover:text-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" /> Fact Checker
            </button>
          </div>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-lg px-3 py-2 text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-bold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="analyst@veriframe.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-bold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-mono text-sm font-bold tracking-wider hover:brightness-110 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            SIGN IN TO SOC <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-mono pt-2 border-t border-slate-200">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};
