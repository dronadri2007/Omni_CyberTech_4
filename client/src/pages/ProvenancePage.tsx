import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Lock, ArrowLeft, Camera, Cpu, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisCase } from '../types';

export const ProvenancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<AnalysisCase | null>(null);

  const caseId = id || 'VF-2026-000124';

  useEffect(() => {
    async function load() {
      try {
        const item = await apiService.getCaseById(caseId);
        setCaseData(item);
      } catch (err) {
        console.error('Error loading provenance details', err);
      }
    }
    load();
  }, [caseId]);

  if (!caseData) {
    return <div className="py-20 text-center font-mono text-blue-600 font-bold">LOADING PROVENANCE DATA...</div>;
  }

  const { provenanceDetails, mediaFile } = caseData;

  return (
    <div className="space-y-6 py-4 font-mono">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/analyze/results/${caseData.id}`} className="p-2 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              C2PA PROVENANCE & CHAIN OF CUSTODY
            </h1>
            <p className="text-xs text-slate-500 font-semibold">Cryptographic hardware signature audit for {caseData.id}</p>
          </div>
        </div>
      </div>

      {/* C2PA Verification Status Box */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between shadow-sm ${
        provenanceDetails.c2paValid
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
          : 'bg-red-50 border-red-300 text-red-900'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${provenanceDetails.c2paValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {provenanceDetails.c2paValid ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <div className="text-lg font-bold">
              {provenanceDetails.c2paValid ? 'C2PA HARDWARE MANIFEST VERIFIED' : 'UNVERIFIED OR MISSING C2PA MANIFEST'}
            </div>
            <p className="text-xs font-sans text-slate-700 font-medium mt-0.5">
              {provenanceDetails.c2paValid
                ? `Digitally signed by hardware authority: ${provenanceDetails.issuer}`
                : 'No trusted cryptographic hardware provenance chain could be established for this upload.'}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device & Capture Hardware */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <h3 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" /> CAPTURE HARDWARE & FIRMWARE
          </h3>
          <div className="space-y-2 text-xs font-sans text-slate-700 font-medium">
            <div>Camera Make: <span className="font-mono text-blue-700 font-bold">{provenanceDetails.cameraMake || 'Unknown'}</span></div>
            <div>Camera Model: <span className="font-mono text-blue-700 font-bold">{provenanceDetails.cameraModel || 'Unknown'}</span></div>
            <div>Signature Seal Timestamp: <span className="font-mono text-slate-500">{provenanceDetails.signatureTimestamp || 'N/A'}</span></div>
          </div>
        </div>

        {/* Software Modification History */}
        <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <h3 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" /> SOFTWARE EDIT TRAIL
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-800 font-sans font-medium">
            {provenanceDetails.softwareHistory.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span className="font-mono">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
