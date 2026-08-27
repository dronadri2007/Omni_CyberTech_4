import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Download, FileJson, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { apiService } from '../services/api';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const ReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const caseId = id || 'VF-2026-000124';

  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getReport(caseId);
        setReport(res);
      } catch (err) {
        console.error('Error fetching report', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  if (loading || !report) {
    return <div className="py-20 text-center font-mono text-blue-600 font-bold">GENERATING VERIFICATION CERTIFICATE REPORT...</div>;
  }

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VERIFRAME_Report_${caseId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const c = report.caseSummary;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-mono">
      {/* Printable Actions Bar */}
      <div className="print:hidden flex items-center justify-between border-b border-slate-200 pb-4">
        <Link to={`/analyze/results/${caseId}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Analysis Results
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-blue-700 hover:border-blue-500 transition-all flex items-center gap-1.5 font-bold shadow-sm"
          >
            <FileJson className="w-4 h-4" /> Export Raw JSON
          </button>
          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:brightness-110 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download PDF Certificate
          </button>
        </div>
      </div>

      {/* OFFICIAL VERIFICATION CERTIFICATE CARD */}
      <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 space-y-8 print:border-black shadow-xl text-slate-900">
        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b border-slate-200 print:border-gray-300 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider text-slate-900">VERIFRAME</h1>
              <p className="text-[11px] text-blue-700 font-bold">MULTIMODAL MEDIA AUTHENTICITY CERTIFICATE</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>REPORT ID: <span className="text-blue-700 font-bold">{report.reportId}</span></div>
            <div>ISSUED: {new Date(report.generatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Verdict Overview */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-slate-500 text-xs block font-bold">AUDIT VERDICT</span>
            <div className="mt-1">
              <VerdictBadge verdict={c.verdict} size="lg" />
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs block font-bold">MANIPULATION PROBABILITY</span>
            <span className="text-2xl font-bold text-red-600">{c.manipulationProbability}%</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block font-bold">AUTHENTICITY RATING</span>
            <span className="text-2xl font-bold text-emerald-600">{c.authenticityScore}%</span>
          </div>
        </div>

        {/* Media Information Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-slate-500 uppercase">1. MEDIA ASSET PROFILES</h3>
          <div className="border border-slate-200 rounded-lg p-4 font-sans text-xs space-y-2 bg-slate-50/50">
            <div>Filename: <span className="font-mono text-blue-700 font-bold">{report.mediaDetails?.filename || c.title}</span></div>
            <div>MIME Type: <span className="font-mono font-bold">{report.mediaDetails?.mimeType || 'video/mp4'}</span></div>
            <div>SHA-256 Hash: <span className="font-mono text-slate-600 break-all font-bold">{report.mediaDetails?.fileHash}</span></div>
          </div>
        </div>

        {/* Detection Breakdown */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs text-slate-500 uppercase">2. ENSEMBLE DETECTION METRICS</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-500 block font-bold">FACE FORGERY</span>
              <span className="font-bold text-red-600">{report.detectionBreakdown?.faceForgeryScore}%</span>
            </div>
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-500 block font-bold">TEMPORAL JITTER</span>
              <span className="font-bold text-amber-600">{report.detectionBreakdown?.temporalConsistencyScore}%</span>
            </div>
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-500 block font-bold">LIP SYNC</span>
              <span className="font-bold text-blue-600">{report.detectionBreakdown?.audioVisualSyncScore}%</span>
            </div>
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-slate-500 block font-bold">C2PA PROVENANCE</span>
              <span className="font-bold text-emerald-600">{report.detectionBreakdown?.provenanceStatus}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 font-sans leading-relaxed">
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
