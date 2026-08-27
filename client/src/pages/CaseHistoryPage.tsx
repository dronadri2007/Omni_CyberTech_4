import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, History, Trash2, Eye, Shield } from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisCase } from '../types';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { RiskIndicator } from '../components/common/RiskIndicator';

export const CaseHistoryPage: React.FC = () => {
  const [cases, setCases] = useState<AnalysisCase[]>([]);
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [mediaFilter, setMediaFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await apiService.getCases({
          search: search || undefined,
          verdict: verdictFilter !== 'ALL' ? verdictFilter : undefined,
          mediaType: mediaFilter !== 'ALL' ? mediaFilter : undefined,
        });
        setCases(res.cases);
      } catch (err) {
        console.error('Error fetching cases', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, [search, verdictFilter, mediaFilter]);

  const handleDelete = async (caseId: string) => {
    if (confirm(`Are you sure you want to delete case ${caseId}?`)) {
      await apiService.deleteCase(caseId);
      setCases(cases.filter((c) => c.id !== caseId));
    }
  };

  return (
    <div className="space-y-6 py-4 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            CASE HISTORY MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Search, filter and manage historical media verification audits</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Case ID or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        {/* Verdict filter dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">Verdict:</span>
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Verdicts</option>
            <option value="AUTHENTIC">Authentic</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="MANIPULATED">Manipulated</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
          </select>
        </div>

        {/* Media type filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">Type:</span>
          <select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Types</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">CASE ID</th>
                <th className="py-3 px-4">MEDIA FILE</th>
                <th className="py-3 px-4">VERDICT</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">RISK</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">
                    <Link to={`/cases/${c.id}`} className="hover:underline">
                      {c.id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-800 font-medium max-w-xs truncate">{c.title}</td>
                  <td className="py-3 px-4">
                    <VerdictBadge verdict={c.verdict} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.confidence}%</td>
                  <td className="py-3 px-4">
                    <RiskIndicator risk={c.riskLevel} />
                  </td>
                  <td className="py-3 px-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      to={`/cases/${c.id}`}
                      className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all text-[11px] font-bold"
                    >
                      DETAILS
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-2 py-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all text-[11px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
