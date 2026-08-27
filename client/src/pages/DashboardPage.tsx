import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  Search,
  Upload,
  ArrowUpRight,
  Shield,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';
import { AnalysisStats, AnalysisCase } from '../types';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [cases, setCases] = useState<AnalysisCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, casesData] = await Promise.all([
          apiService.getStats(),
          apiService.getCases()
        ]);
        setStats(statsData);
        setCases(casesData.cases);
      } catch (err) {
        console.error('Failed loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            CYBERSECURITY SOC DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time media authenticity telemetries and neural ensemble monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-mono text-xs font-bold rounded-lg hover:brightness-110 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> NEW ANALYSIS
          </Link>
        </div>
      </div>

      {/* METRIC COUNTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-5 rounded-xl border border-slate-200 space-y-2 relative overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">TOTAL ANALYSES</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.totalAnalyses.toLocaleString() || '2,481'}</div>
          <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% this week
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-200 space-y-2 relative overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">SUSPICIOUS MEDIA</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats?.suspiciousCount || '342'}</div>
          <div className="text-[11px] text-slate-500">Deepfake / Edit flags</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-200 space-y-2 relative overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">VERIFIED AUTHENTIC</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats?.authenticCount.toLocaleString() || '1,827'}</div>
          <div className="text-[11px] text-emerald-600 font-bold">73.6% of verified ingest</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-200 space-y-2 relative overflow-hidden bg-white shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">HUMAN REVIEWS</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">{stats?.humanReviewsCount || '38'}</div>
          <div className="text-[11px] text-indigo-600 font-bold">Active in Queue</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detection Trend Line Chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-mono font-bold text-sm text-slate-900">DETECTION TREND (LAST 7 DAYS)</h3>
            <span className="text-xs font-mono text-blue-600 font-bold">Inferences & Flags</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trendData || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                  itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="analyses" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Total Ingest" />
                <Line type="monotone" dataKey="flagged" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Flagged Synthetic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verdict Distribution Donut Chart */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-mono font-bold text-sm text-slate-900">VERDICT DISTRIBUTION</h3>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.verdictDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(stats?.verdictDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {(stats?.verdictDistribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}:</span>
                <span className="text-slate-900 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ANALYSES TABLE */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-mono">
          <h3 className="font-bold text-sm text-slate-900">RECENT INVESTIGATION CASES</h3>
          <Link to="/cases" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold">
            VIEW ALL CASES ({cases.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">CASE ID</th>
                <th className="py-3 px-4">MEDIA FILE</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">SCORE</th>
                <th className="py-3 px-4">VERDICT</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{c.id}</td>
                  <td className="py-3 px-4 text-slate-800 font-sans max-w-xs truncate font-medium">{c.title}</td>
                  <td className="py-3 px-4 text-slate-500 font-bold">
                    {c.mediaFile.mimeType.includes('video') ? 'VIDEO' : c.mediaFile.mimeType.includes('audio') ? 'AUDIO' : 'IMAGE'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${c.manipulationProbability > 70 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {c.confidence}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <VerdictBadge verdict={c.verdict} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/analyze/results/${c.id}`}
                      className="px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all text-[11px] font-bold"
                    >
                      INSPECT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
