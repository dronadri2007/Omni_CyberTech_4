import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Eye, Film, Volume2, Layers, ArrowLeft, Shield } from 'lucide-react';
import { apiService } from '../services/api';
import { AnalysisCase } from '../types';
import { HeatmapCanvas } from '../components/common/HeatmapCanvas';
import { VideoTimelineViewer } from '../components/common/VideoTimelineViewer';
import { AudioWaveformViewer } from '../components/common/AudioWaveformViewer';

type EvidenceTab = 'visual' | 'temporal' | 'audio' | 'metadata';

export const MediaEvidencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<AnalysisCase | null>(null);
  const [activeTab, setActiveTab] = useState<EvidenceTab>('visual');
  const [loading, setLoading] = useState(true);

  const caseId = id || 'VF-2026-000124';

  useEffect(() => {
    async function load() {
      try {
        const item = await apiService.getCaseById(caseId);
        setCaseData(item);
      } catch (err) {
        console.error('Failed loading case evidence', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  if (loading || !caseData) {
    return <div className="py-20 text-center font-mono text-blue-600 font-bold">LOADING EVIDENCE DATA...</div>;
  }

  const { mediaFile, detectionResults, provenanceDetails } = caseData;
  const isVideo = mediaFile.mimeType.includes('video');
  const isAudio = mediaFile.mimeType.includes('audio');

  return (
    <div className="space-y-6 py-4">
      {/* Header with back link */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 font-mono">
        <div className="flex items-center gap-3">
          <Link to={`/analyze/results/${caseData.id}`} className="p-2 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">FORENSIC MEDIA EVIDENCE VIEWER</h1>
            <p className="text-xs text-slate-500">Case ID: <span className="text-blue-700 font-bold">{caseData.id}</span> • {mediaFile.filename}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 font-mono text-xs">
        <button
          onClick={() => setActiveTab('visual')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-bold transition-all ${
            activeTab === 'visual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" /> ANOMALY HEATMAP (ELA)
        </button>

        {isVideo && (
          <button
            onClick={() => setActiveTab('temporal')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-bold transition-all ${
              activeTab === 'temporal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" /> TEMPORAL TIMELINE
          </button>
        )}

        {(isAudio || isVideo) && (
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-bold transition-all ${
              activeTab === 'audio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Volume2 className="w-4 h-4" /> AUDIO SPECTRAL WAVEFORM
          </button>
        )}

        <button
          onClick={() => setActiveTab('metadata')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-bold transition-all ${
            activeTab === 'metadata' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> RAW METADATA
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'visual' && (
        <HeatmapCanvas imageUrl={mediaFile.storageUrl} heatmapMatrix={detectionResults.heatmapMatrix} />
      )}

      {activeTab === 'temporal' && (
        <VideoTimelineViewer storageUrl={mediaFile.storageUrl} anomalies={detectionResults.timelineAnomalies} />
      )}

      {activeTab === 'audio' && (
        <AudioWaveformViewer waveformSegments={detectionResults.waveformSegments} />
      )}

      {activeTab === 'metadata' && (
        <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 font-mono text-xs shadow-sm">
          <h3 className="font-bold text-sm text-blue-700">EXIF & CONTAINER FILE HEADERS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">CONTAINER INFO</span>
              <div>Filename: <span className="text-slate-900 font-bold">{mediaFile.filename}</span></div>
              <div>MIME Type: <span className="text-slate-900">{mediaFile.mimeType}</span></div>
              <div>Size: <span className="text-slate-900">{(mediaFile.sizeBytes / 1024 / 1024).toFixed(2)} MB</span></div>
              <div>SHA-256 Hash: <span className="text-blue-700 font-mono break-all font-bold">{mediaFile.fileHash}</span></div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-slate-500 block font-bold">EXIF DATA TAGS</span>
              <pre className="text-[11px] text-slate-800 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(provenanceDetails.exifData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
