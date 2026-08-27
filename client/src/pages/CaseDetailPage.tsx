import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, UserCheck, Share2, Trash2, Eye, FileText, Lock, Clock, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisCase } from '../types';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { RiskIndicator } from '../components/common/RiskIndicator';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<AnalysisCase | null>(null);

  const caseId = id || 'VF-2026-000124';

  useEffect(() => {
    async function load() {
      try {
        const item = await apiService.getCaseById(caseId);
        setCaseData(item);
      } catch (err) {
        console.error('Error loading case detail', err);
      }
    }
    load();
  }, [caseId]);

  if (!caseData) {
    return <div className="py-20 text-center font-mono text-blue-600 font-bold">LOADING CASE DETAILS...</div>;
  }

  const handleDelete = async () => {
    if (confirm(`Delete case ${caseData.id}?`)) {
      await apiService.deleteCase(caseData.id);
      navigate('/cases');
    }
  };

  return (
    <div className="space-y-6 py-4 font-mono">
      {/* Top Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/cases" className="p-2 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              CASE FILE: <span className="text-blue-700">{caseData.id}</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Submitted: {new Date(caseData.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/reports/${caseData.id}`}
            className="px-3.5 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:brightness-110 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </Link>
          <button
            onClick={() => alert('Shareable URL copied to clipboard: https://veriframe.io/case/' + caseData.id)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 hover:border-slate-400 font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Main Grid: Info + Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Media & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <h3 className="font-bold text-xs text-slate-500 uppercase">MEDIA PREVIEW</h3>
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center shadow-md">
              <img
                src={caseData.mediaFile.storageUrl}
                alt="Media preview"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-2 left-2">
                <VerdictBadge verdict={caseData.verdict} size="sm" />
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-700 font-sans">
              <div className="font-bold font-mono text-blue-700 text-sm">{caseData.mediaFile.filename}</div>
              <div>Type: <span className="font-bold">{caseData.mediaFile.mimeType}</span></div>
              <div>Size: <span className="font-bold">{(caseData.mediaFile.sizeBytes / 1024 / 1024).toFixed(2)} MB</span></div>
              <div className="font-mono text-[11px] text-slate-500 truncate">SHA-256: {caseData.mediaFile.fileHash}</div>
            </div>

            <Link
              to={`/evidence/${caseData.id}`}
              className="w-full py-2.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Eye className="w-4 h-4" /> Open Full Evidence Viewer
            </Link>
          </div>
        </div>

        {/* Right Column: Detailed Breakdown & Activity Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">DETECTION METRICS</h3>
              <RiskIndicator risk={caseData.riskLevel} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">FACE FORGERY</span>
                <span className="text-lg font-bold text-red-600">{caseData.detectionResults.faceForgeryScore}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">TEMPORAL</span>
                <span className="text-lg font-bold text-amber-600">{caseData.detectionResults.temporalScore}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">AUDIO-VISUAL</span>
                <span className="text-lg font-bold text-blue-600">{caseData.detectionResults.audioVisualScore}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">METADATA RISK</span>
                <span className="text-lg font-bold text-indigo-600">{caseData.detectionResults.metadataScore}%</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-slate-600 text-xs font-bold block">MODEL REASONING HIGHLIGHTS</span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-sans font-medium">
                {caseData.detectionResults.reasoningHighlights.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Activity Log Timeline */}
          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
            <h3 className="font-bold text-xs text-slate-600 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> ACTIVITY & AUDIT TRAIL
            </h3>
            <div className="space-y-2 text-xs font-sans text-slate-700 font-medium">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <span>Ingested into VERIFRAME SOC</span>
                <span className="text-slate-500 font-mono text-[11px] font-bold">{new Date(caseData.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <span>Forensic analysis complete (forensic-v1)</span>
                <span className="text-slate-500 font-mono text-[11px] font-bold">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
