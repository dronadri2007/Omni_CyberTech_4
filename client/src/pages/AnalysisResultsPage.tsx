import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Radio,
  Activity,
  Layers,
  Lock,
  Download,
  UserCheck,
  ArrowRight,
  Share2,
  FileText,
  HelpCircle,
  Eye
} from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisCase } from '../types';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { VerdictBadge } from '../components/common/VerdictBadge';
import { RiskIndicator } from '../components/common/RiskIndicator';

export const AnalysisResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<AnalysisCase | null>(null);
  const [loading, setLoading] = useState(true);

  const caseId = id || 'VF-2026-000124';

  useEffect(() => {
    async function loadCase() {
      try {
        const item = await apiService.getCaseById(caseId);
        setCaseData(item);
      } catch (err) {
        console.error('Failed loading case results', err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  if (loading || !caseData) {
    return (
      <div className="py-20 text-center font-mono text-blue-600 font-bold">
        LOADING VERIFICATION RESULTS...
      </div>
    );
  }

  const { verdict, confidence, authenticityScore, manipulationProbability, riskLevel, detectionResults, provenanceDetails, mediaFile } = caseData;

  const isManipulated = verdict === 'MANIPULATED';
  const isSuspicious = verdict === 'SUSPICIOUS';
  const isAuthentic = verdict === 'AUTHENTIC';

  const verdictBannerBg = isManipulated
    ? 'bg-red-50/80 border-red-300 shadow-sm'
    : isSuspicious
    ? 'bg-amber-50/80 border-amber-300 shadow-sm'
    : isAuthentic
    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
    : 'bg-slate-50 border-slate-300 shadow-sm';

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner with Navigation Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 font-mono">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Link to="/cases" className="hover:text-blue-600 font-bold">CASES</Link>
            <span>/</span>
            <span className="text-blue-700 font-bold">{caseData.id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">VERIFICATION RESULT FILE</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/evidence/${caseData.id}`}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs text-blue-700 hover:border-blue-500 transition-all flex items-center gap-1.5 font-bold shadow-sm"
          >
            <Eye className="w-4 h-4" /> EVIDENCE VIEWER
          </Link>
          <Link
            to={`/reports/${caseData.id}`}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:brightness-110 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> REPORT
          </Link>
        </div>
      </div>

      {/* PROMINENT VERDICT & CONFIDENCE SCORE BANNER */}
      <div className={`p-8 rounded-2xl border ${verdictBannerBg} grid grid-cols-1 md:grid-cols-12 gap-8 items-center`}>
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <ScoreBadge score={confidence} label={isAuthentic ? 'AUTHENTICITY SCORE' : 'MANIPULATION PROB'} inverted={!isAuthentic} size="xl" />
        </div>

        <div className="md:col-span-8 space-y-4 font-mono">
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={verdict} size="lg" />
            <RiskIndicator risk={riskLevel} />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            {isManipulated && 'Likely Synthetic or Manipulated Media'}
            {isSuspicious && 'Suspicious Editing Signals Flagged'}
            {isAuthentic && (provenanceDetails.c2paValid ? 'Cryptographically Verified Authentic' : 'No Manipulation Indicators Detected')}
            {verdict === 'INCONCLUSIVE' && 'Inconclusive Analysis Signal'}
          </h2>

          <p className="text-xs text-slate-700 font-sans leading-relaxed font-medium">
            Target file <span className="font-mono text-blue-700 font-bold">{mediaFile.filename}</span> was evaluated by the VERIFRAME{' '}
            <span className="font-mono text-blue-700 font-bold">{caseData.detectionResults.modelVersion}</span> engine
            {' '}(Error-Level Analysis, EXIF, C2PA provenance).
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to={`/provenance/${caseData.id}`}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-500 transition-all flex items-center gap-1 font-bold shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" /> C2PA Provenance: <span className="font-bold text-blue-700">{provenanceDetails.c2paValid ? 'VERIFIED' : 'UNVERIFIED'}</span>
            </Link>
            <button
              onClick={async () => {
                await apiService.sendForReview(caseData.id, 'Submitted from results page');
                alert('Submitted to Human Review Queue!');
              }}
              className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-800 hover:bg-purple-100 transition-all flex items-center gap-1 font-bold shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" /> Send to Human Review
            </button>
          </div>
        </div>
      </div>

      {/* EXPLAINABLE AI METRICS CARDS */}
      <div className="space-y-4">
        <h3 className="font-mono font-bold text-sm text-slate-900 uppercase tracking-wider">
          EXPLAINABLE AI BREAKDOWN
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono">
          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>FACE FORGERY</span>
              <Cpu className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{detectionResults.faceForgeryScore}%</div>
            <p className="text-[10px] text-slate-500 font-sans">Facial landmark spatial jitter</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>TEMPORAL SYNC</span>
              <Radio className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{detectionResults.temporalScore}%</div>
            <p className="text-[10px] text-slate-500 font-sans">Frame interpolation anomaly</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>AUDIO-VISUAL</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{detectionResults.audioVisualScore}%</div>
            <p className="text-[10px] text-slate-500 font-sans">Lip movement phase match</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>METADATA RISK</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{detectionResults.metadataScore}%</div>
            <p className="text-[10px] text-slate-500 font-sans">EXIF anomaly rating</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>PROVENANCE</span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-emerald-600 truncate">{detectionResults.provenanceStatus}</div>
            <p className="text-[10px] text-slate-500 font-sans">Hardware digital seal</p>
          </div>
        </div>
      </div>

      {/* PLAIN LANGUAGE VERDICT EXPLANATION */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="font-mono font-bold text-sm text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          WHY THIS MEDIA WAS FLAGGED (EXPLANATION RATIONALE)
        </h3>

        <ul className="space-y-2.5 font-sans text-xs text-slate-700 font-medium">
          {detectionResults.reasoningHighlights.map((highlight, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        {/* IMPORTANT TRUST NOTICE */}
        <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 flex items-start gap-3 text-xs text-slate-700 font-sans">
          <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-900 font-mono">IMPORTANT INSTITUTIONAL NOTICE:</span>
            <p className="mt-0.5">
              AI detection is probabilistic and should not be treated as absolute proof. High confidence scores indicate neural ensemble anomalies that warrant editorial and forensic cross-examination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
