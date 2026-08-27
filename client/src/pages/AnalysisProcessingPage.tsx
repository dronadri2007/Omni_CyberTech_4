import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cpu, CheckCircle2, Loader2, ArrowRight, ShieldAlert, Sparkles, Activity } from 'lucide-react';

const STAGES = [
  { id: 1, title: 'Step 1 — Ingest', desc: 'Uploading & validating media stream container...' },
  { id: 2, title: 'Step 2 — Extract', desc: 'Extracting keyframes, audio tracks & EXIF metadata...' },
  { id: 3, title: 'Step 3 — Face Analysis', desc: 'Error-Level Analysis: recompression residue by region...' },
  { id: 4, title: 'Step 4 — Temporal Analysis', desc: 'Noise-floor & smoothness statistics vs. sensor capture...' },
  { id: 5, title: 'Step 5 — Audio Analysis', desc: 'Checking audio characteristics & phonetic lip-sync...' },
  { id: 6, title: 'Step 6 — Provenance', desc: 'C2PA manifest probe & SHA-256 content hash...' },
  { id: 7, title: 'Step 7 — Aggregate & Explain', desc: 'Combining forensic signals & generating the anomaly heatmap...' },
];

export const AnalysisProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const caseId = id || 'VF-2026-000124';

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(12);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          const next = prev + 1;
          setProgressPct(Math.round(((next + 1) / STAGES.length) * 100));
          return next;
        } else {
          clearInterval(timer);
          setProgressPct(100);
          setIsDone(true);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 cyber-grid">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-800 font-mono text-xs font-bold shadow-sm">
          <Activity className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>REAL-TIME INFERENCE IN PROGRESS</span>
        </div>
        <h1 className="text-3xl font-extrabold font-mono text-slate-900">
          ANALYZING CASE: <span className="text-blue-700">{caseId}</span>
        </h1>
        <p className="text-xs font-mono text-slate-600">
          Executing parallel spatial, temporal, spectral & provenance detection pipelines
        </p>
      </div>

      {/* Main Animated Card */}
      <div className="glass-panel-glow p-8 rounded-2xl border border-blue-300 bg-white space-y-8 relative overflow-hidden shadow-xl">
        {/* Radar spinning background visual */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full border border-blue-300/40 flex items-center justify-center pointer-events-none opacity-50">
          <div className="w-full h-0.5 bg-blue-600 animate-radar-spin origin-left" />
        </div>

        {/* Progress Bar Header */}
        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-800 font-bold">ENSEMBLE PROGRESS</span>
            <span className="text-blue-700 font-extrabold text-lg">{progressPct}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full border border-slate-300 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-full transition-all duration-300 shadow-md shadow-blue-500/40"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 7 STAGES LIST */}
        <div className="space-y-3 font-mono">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex || isDone;
            const isCurrent = idx === currentStageIndex && !isDone;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-md'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-white border-slate-200 opacity-50 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                  )}

                  <div>
                    <h4 className="font-bold text-xs">{st.title}</h4>
                    <p className="text-[11px] text-slate-600 font-sans">{st.desc}</p>
                  </div>
                </div>

                {isCurrent && <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold">RUNNING</span>}
                {isCompleted && <span className="text-[10px] text-emerald-600 font-bold">OK</span>}
              </div>
            );
          })}
        </div>

        {/* Active Stage Log Ticker */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] font-mono text-blue-700 font-bold flex items-center justify-between">
          <span>LOG: {STAGES[currentStageIndex]?.desc}</span>
          <span className="animate-pulse">● LIVE</span>
        </div>

        {/* Completion Action Button */}
        {isDone && (
          <button
            onClick={() => navigate(`/analyze/results/${caseId}`)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-mono text-base font-extrabold tracking-wider hover:brightness-110 shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 animate-bounce"
          >
            ANALYSIS COMPLETE — VIEW RESULTS <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
