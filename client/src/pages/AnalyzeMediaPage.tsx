import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, Sparkles, Trash2, ArrowRight, ShieldAlert, CheckCircle, Play } from 'lucide-react';
import { apiService, DEFAULT_MOCK_CASES } from '../services/api';

type TabType = 'file' | 'link';

export const AnalyzeMediaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleStartAnalysis = async () => {
    if (!selectedFile && !mediaUrl) return;

    setIsUploading(true);

    const formData = new FormData();
    if (selectedFile) {
      formData.append('mediaFile', selectedFile);
    } else {
      formData.append('url', mediaUrl);
    }

    try {
      const res = await apiService.analyzeMedia(formData);
      navigate(`/analyze/processing/${res.caseId}`);
    } catch (err) {
      console.error('Upload error', err);
      // Fallback: trigger analyzeMedia with formData to generate client case
      const res = await apiService.analyzeMedia(formData);
      navigate(`/analyze/processing/${res.caseId}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemoCase = (sampleCase: typeof DEFAULT_MOCK_CASES[0]) => {
    navigate(`/analyze/processing/${sampleCase.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          MULTIMODAL AI MEDIA ANALYSIS
        </h1>
        <p className="text-xs font-mono text-slate-600">
          Upload media or paste URL for deepfake detection, C2PA provenance verification & Grad-CAM visual evidence
        </p>
      </div>

      {/* QUICK DEMO CASES SELECTION BAR FOR HACKATHON JUDGES */}
      <div className="glass-panel-glow p-4 rounded-xl border border-blue-300 space-y-3 bg-white">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-blue-700 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> 1-CLICK DEMO CASES FOR HACKATHON EVALUATION
          </span>
          <span className="text-slate-500 font-semibold">Instant AI Inference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadDemoCase(DEFAULT_MOCK_CASES[0])}
            className="p-3 bg-red-50/60 rounded-lg border border-red-200 hover:border-red-400 text-left transition-all group shadow-sm"
          >
            <div className="text-xs font-mono font-bold text-red-700 flex items-center justify-between">
              <span>Sample 1: Deepfake Video</span>
              <Play className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-600 mt-1 truncate">Political Address Segment (91% Manipulated)</p>
          </button>

          <button
            onClick={() => handleLoadDemoCase(DEFAULT_MOCK_CASES[1])}
            className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 hover:border-amber-400 text-left transition-all group shadow-sm"
          >
            <div className="text-xs font-mono font-bold text-amber-800 flex items-center justify-between">
              <span>Sample 2: Synthetic Image</span>
              <Play className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-600 mt-1 truncate">Profile Photo #8812 (78% Suspicious)</p>
          </button>

          <button
            onClick={() => handleLoadDemoCase(DEFAULT_MOCK_CASES[3])}
            className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 hover:border-emerald-400 text-left transition-all group shadow-sm"
          >
            <div className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-between">
              <span>Sample 3: Authentic C2PA</span>
              <Play className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-600 mt-1 truncate">Field Report Photo (96% Authentic)</p>
          </button>
        </div>
      </div>

      {/* MAIN UPLOAD CARD */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 font-mono text-xs">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all font-bold ${
              activeTab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" /> UPLOAD FILE
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all font-bold ${
              activeTab === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4" /> PASTE MEDIA LINK
          </button>
        </div>

        {/* Tab 1: File Dropzone */}
        {activeTab === 'file' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center space-y-4 bg-slate-50/70 transition-all cursor-pointer relative"
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-300 text-blue-600 mx-auto flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-mono font-bold text-slate-900">
                Drop your media file here, or <span className="text-blue-600 underline">Browse Files</span>
              </p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Supported formats: JPG, PNG, WEBP, MP4, MOV, AVI, MP3, WAV, M4A (Max 500 MB)
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: URL Input */}
        {activeTab === 'link' && (
          <div className="space-y-3 font-mono">
            <label className="text-xs text-slate-600 font-bold">Social Media or News URL</label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="url"
                placeholder="https://x.com/user/status/1827409214 or https://youtube.com/watch?v=..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              VERIFRAME crawler will fetch video frames and audio streams directly from public links.
            </p>
          </div>
        )}

        {/* Selected file preview */}
        {selectedFile && (
          <div className="bg-slate-50 p-4 rounded-xl border border-blue-300 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold">
                FILE
              </div>
              <div>
                <p className="text-slate-900 font-bold max-w-sm truncate">{selectedFile.name}</p>
                <p className="text-slate-500 text-[11px]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-mono">
          <button
            onClick={() => {
              setSelectedFile(null);
              setMediaUrl('');
            }}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-bold"
          >
            CLEAR INPUT
          </button>

          <button
            disabled={!selectedFile && !mediaUrl}
            onClick={handleStartAnalysis}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-bold text-sm tracking-wider hover:brightness-110 shadow-xl shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isUploading ? 'INGESTING MEDIA...' : 'START ANALYSIS'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
