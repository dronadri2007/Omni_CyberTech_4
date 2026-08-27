import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Upload,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  FileCheck2,
  Users,
  Radio,
  Search,
  Eye,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  Scan,
  Grid
} from 'lucide-react';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* BACKGROUND DEEPFAKE DETECTION IMAGE PATTERN & MESH GRAPHICS */}
      <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
      <div className="absolute inset-0 deepfake-bg-pattern opacity-40 pointer-events-none" />

      {/* Floating Fake Image Detection Mesh Wireframe Background Ornaments */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & CTA */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>ENTERPRISE MULTIMODAL MEDIA VERIFICATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Verify what you see.<br />
            <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 bg-clip-text text-transparent">
              Trust what you share.
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
            AI-powered detection for deepfakes, manipulated images, synthetic audio, and suspicious video. Institutional-grade authenticity verification for journalists, fact-checkers, and security teams.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white font-mono text-sm font-bold tracking-wider hover:brightness-110 shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> ANALYZE MEDIA <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
            >
              SEE HOW IT WORKS
            </a>
          </div>

          {/* Quick Metrics ticker */}
          <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200 max-w-lg font-mono">
            <div>
              <div className="text-2xl font-bold text-blue-700">99.2%</div>
              <div className="text-xs text-slate-500 mt-0.5">Ensemble Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">&lt;1.5s</div>
              <div className="text-xs text-slate-500 mt-0.5">Inference Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">C2PA</div>
              <div className="text-xs text-slate-500 mt-0.5">Verified Hardware</div>
            </div>
          </div>
        </div>

        {/* Right Column: SOC Visual Mockup with FAKE DETECTION IMAGE GRAPHICS */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl glass-panel-glow p-6 space-y-6 shadow-2xl border border-blue-300/60 overflow-hidden bg-white/95">
            {/* Animated Laser Scan line */}
            <div className="absolute inset-0 bg-blue-500/10 pointer-events-none animate-scan-line border-b-2 border-blue-500/60" />

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">LIVE FAKE DETECTION MESH</span>
              </div>
              <VerdictBadge verdict="MANIPULATED" size="sm" />
            </div>

            <div className="flex items-center justify-around py-2">
              <ScoreBadge score={87} label="MANIPULATION PROB" inverted size="lg" />
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-600">Face Forgery:</span>
                  <span className="text-red-600 font-bold">92%</span>
                </div>
                <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-600">Temporal Sync:</span>
                  <span className="text-amber-600 font-bold">71%</span>
                </div>
                <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-600">C2PA Seal:</span>
                  <span className="text-red-600 font-bold">FAILED</span>
                </div>
              </div>
            </div>

            {/* FAKE IMAGE DETECTION GRAPHIC BOX WITH BOUNDING BOXES & LANDMARK WIRES */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex items-center justify-center shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="Deepfake Detection Scanning Mock"
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* Simulated Facial Bounding Box Overlay */}
              <div className="absolute inset-x-12 inset-y-6 border-2 border-red-500/80 rounded-lg flex flex-col justify-between p-1 animate-pulse pointer-events-none">
                <div className="flex justify-between items-start text-[9px] font-mono bg-red-600 text-white px-1.5 py-0.5 rounded font-bold w-fit">
                  DEEPFAKE FACE BOUNDARY DETECTED (92%)
                </div>
                <div className="text-[9px] font-mono bg-slate-900/90 text-red-400 px-1.5 py-0.5 rounded border border-red-500/50 self-end">
                  GAN Noise Spectrum: Anomalous
                </div>
              </div>

              {/* Facial Mesh Dots Simulation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 border border-cyan-400/60 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 border border-red-400/80 rounded-full" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 bg-white/90 border border-slate-200 px-2.5 py-1 rounded text-[10px] font-mono text-red-600 flex items-center gap-1.5 shadow-md">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>ELA: Spatial Anomaly Flagged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED VERIFICATION MODALITIES */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">MULTIMODAL INGESTION</h2>
            <p className="text-2xl font-bold text-slate-900">Verification Across All Digital Formats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Image Verification', desc: 'Detect facial synthesis, diffusion artifacts, and Photoshop edits in JPG, PNG, WEBP.', icon: Eye },
              { title: 'Video Verification', desc: 'Analyze lip-sync mismatch, optical flow jitter, and face-swap boundaries in MP4, MOV.', icon: Radio },
              { title: 'Audio Verification', desc: 'Identify ElevenLabs voice cloning, neural vocoder phase shifts in MP3, WAV.', icon: Activity },
              { title: 'Link Verification', desc: 'Directly ingest social media links from X, YouTube, Telegram, or news outlets.', icon: Search },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-xl space-y-3 hover:border-blue-500/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (6 STEPS) */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">VERIFICATION PIPELINE</span>
          <h2 className="text-3xl font-extrabold text-slate-900">How VERIFRAME Operates</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-sans">
            End-to-end automated pipeline executing frame extraction, deep neural detection, C2PA manifest validation, and human review fallback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Ingest', desc: 'Upload file or paste media URL.' },
            { step: '02', title: 'Extract', desc: 'Keyframes, audio spectra & EXIF.' },
            { step: '03', title: 'Analyze', desc: 'Parallel Spatial & Temporal Neural Net.' },
            { step: '04', title: 'Verify', desc: 'Check C2PA signature & chain.' },
            { step: '05', title: 'Explain', desc: 'Generate anomaly heatmap & reasoning.' },
            { step: '06', title: 'Report', desc: 'Export PDF certificate or JSON.' },
          ].map((s, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border border-slate-200 space-y-3 relative group hover:border-blue-500/50 transition-all">
              <span className="text-2xl font-mono font-extrabold text-blue-600/40 group-hover:text-blue-600 transition-colors">
                {s.step}
              </span>
              <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
              <p className="text-xs text-slate-600 font-sans leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DETECTION CAPABILITIES */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">AI DETECTION ENGINE</span>
              <h2 className="text-3xl font-extrabold text-slate-900">6 Core Detection Capabilities</h2>
            </div>
            <Link to="/analyze" className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 font-bold">
              TEST YOUR MEDIA NOW <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Face Forgery Detection', desc: 'Identifies deepfake facial swaps, AI facial expression reenactments, and GAN generation artifacts using spatial frequency grids.', icon: Cpu },
              { title: 'Temporal Consistency', desc: 'Analyzes video optical flow frame-by-frame to flag synthetic frame interpolation and temporal flickering.', icon: Radio },
              { title: 'Audio-Visual Sync', desc: 'Cross-verifies phonetic speech audio against lip movement phases to detect audio voice replacements.', icon: Activity },
              { title: 'Metadata Analysis', desc: 'Extracts camera sensor EXIF tags, compression signatures, and software edit histories.', icon: Layers },
              { title: 'C2PA Provenance', desc: 'Validates cryptographic digital manifests embedded by hardware cameras and accredited news outlets.', icon: Lock },
              { title: 'Synthetic Media Detection', desc: 'Detects text-to-image AI generators (Midjourney, DALL-E 3, Stable Diffusion v3, Sora).', icon: Sparkles },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 hover:border-blue-500/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{cap.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">WHO USES VERIFRAME</span>
          <h2 className="text-3xl font-extrabold text-slate-900">Designed for Integrity Organizations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Social Media Users', desc: 'Verify viral videos or dubious political clips before sharing on public networks.' },
            { title: 'Journalists & Fact-Checkers', desc: 'Instantly generate verifiable audit reports for breaking news media verification.' },
            { title: 'Election Integrity Teams', desc: 'Monitor election misinformation campaigns and candidate deepfake impersonations.' },
            { title: 'Cybersecurity SOC Analysts', desc: 'Audit CEO voice cloning wire transfer scams and phishing media assets.' },
            { title: 'Fraud Prevention', desc: 'Authenticate customer identity verification photos and video KYC submissions.' },
            { title: 'Academic Researchers', desc: 'Benchmark synthetic media trends and C2PA adoption across web data.' },
          ].map((uc, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-blue-600 font-mono">{uc.title}</h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to Authenticate Suspicious Media?</h2>
          <p className="text-blue-100 text-sm font-sans">
            Start analyzing images, videos, and audio files with VERIFRAME AI SOC. Instant results with downloadable provenance reports.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-mono text-sm font-bold tracking-wider hover:bg-slate-100 shadow-xl transition-all"
          >
            START FREE ANALYSIS NOW <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
