import React, { useState } from 'react';
import { Play, Pause, AlertOctagon, Film, Clock } from 'lucide-react';

interface VideoTimelineProps {
  storageUrl: string;
  anomalies?: Array<{ timestampSec: number; score: number; label: string }>;
}

export const VideoTimelineViewer: React.FC<VideoTimelineProps> = ({ storageUrl, anomalies = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [activeAnomaly, setActiveAnomaly] = useState<any>(null);

  const durationSec = 12.4;

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
      {/* Video Preview Container */}
      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
        <img
          src={storageUrl}
          alt="Video Frame Preview"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

        {/* Scan line effect over video frame */}
        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none animate-scan-line border-b-2 border-cyan-400/80" />

        {/* Center play button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400 flex items-center justify-center text-cyan-300 hover:scale-110 hover:bg-cyan-500/40 transition-all shadow-2xl shadow-cyan-500/30"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 translate-x-0.5" />}
        </button>

        {/* Active Frame Indicator */}
        <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono text-cyan-400 flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-cyan-400" />
          <span>FRAME: {Math.floor(currentTime * 30)} / {Math.floor(durationSec * 30)}</span>
          <span className="text-slate-500">|</span>
          <Clock className="w-3.5 h-3.5" />
          <span>{currentTime.toFixed(2)}s / {durationSec.toFixed(2)}s</span>
        </div>
      </div>

      {/* Timeline scrubber with anomaly flags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Temporal Anomaly Timeline</span>
          <span className="text-red-400 font-bold">{anomalies.length} Suspicious Regions Detected</span>
        </div>

        <div className="relative h-12 bg-slate-950 rounded-lg border border-slate-800 flex items-center px-4 overflow-hidden">
          {/* Progress bar fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-cyan-500/20 border-r-2 border-cyan-400"
            style={{ width: `${(currentTime / durationSec) * 100}%` }}
          />

          {/* Scrubber slider input */}
          <input
            type="range"
            min="0"
            max={durationSec}
            step="0.1"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />

          {/* Anomaly markers */}
          {anomalies.map((anom, idx) => {
            const leftPct = (anom.timestampSec / durationSec) * 100;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTime(anom.timestampSec);
                  setActiveAnomaly(anom);
                }}
                className="absolute z-30 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${leftPct}%` }}
              >
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/80 animate-pulse border border-white" />
                <span className="opacity-0 group-hover:opacity-100 transition-all absolute -top-8 whitespace-nowrap bg-slate-950 text-red-300 text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/40">
                  {anom.timestampSec}s: {anom.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Anomaly Detail Box */}
      {activeAnomaly && (
        <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-3 text-xs text-red-200">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <div className="font-mono font-bold text-red-300">
              Timestamp {activeAnomaly.timestampSec}s — {activeAnomaly.label}
            </div>
            <div className="text-slate-400 mt-0.5">
              Anomaly score rating: <span className="text-red-400 font-bold">{Math.round(activeAnomaly.score * 100)}%</span> probability of synthetic frame interpolation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
