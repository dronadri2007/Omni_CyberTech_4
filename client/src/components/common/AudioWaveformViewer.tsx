import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Play, Pause, Activity } from 'lucide-react';

interface AudioWaveformProps {
  waveformSegments?: Array<{ startTimeSec: number; endTimeSec: number; anomalyScore: number; label: string }>;
}

export const AudioWaveformViewer: React.FC<AudioWaveformProps> = ({ waveformSegments = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const defaultSegments = waveformSegments.length > 0 ? waveformSegments : [
    { startTimeSec: 0.5, endTimeSec: 2.1, anomalyScore: 0.42, label: 'Natural speech cadence' },
    { startTimeSec: 3.2, endTimeSec: 5.8, anomalyScore: 0.88, label: 'Neural Vocoder Phase Distortion' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 700;
    canvas.height = 140;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw center line
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw audio waveform bars
    const barCount = 120;
    const barWidth = canvas.width / barCount;

    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const progress = i / barCount;
      const sec = progress * 10;

      // Check if inside anomaly segment
      const anomaly = defaultSegments.find(s => sec >= s.startTimeSec && sec <= s.endTimeSec);
      const isHighAnomaly = anomaly && anomaly.anomalyScore > 0.7;

      // Height variation
      const h = Math.abs(Math.sin(i * 0.2) * Math.cos(i * 0.05)) * (canvas.height * 0.7) + 8;
      const y = (canvas.height - h) / 2;

      ctx.fillStyle = isHighAnomaly ? '#ef4444' : (anomaly ? '#f59e0b' : '#06b6d4');
      ctx.fillRect(x + 1, y, barWidth - 2, h);
    }
  }, [defaultSegments]);

  return (
    <div className="flex flex-col gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
          <Activity className="w-4 h-4" />
          <span>SPECTRAL FREQUENCY & VOICE SYNTHESIS ANALYZER</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'PAUSE AUDIO' : 'PLAY AUDIO'}</span>
        </button>
      </div>

      <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-auto object-contain" />
      </div>

      {/* Flagged segments summary */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Flagged Audio Anomaly Segments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {defaultSegments.map((seg, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                seg.anomalyScore > 0.7 ? 'bg-red-950/20 border-red-500/30 text-red-300' : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}
            >
              <div>
                <span className="font-bold">{seg.startTimeSec}s - {seg.endTimeSec}s</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{seg.label}</p>
              </div>
              <span className="font-bold text-sm">{Math.round(seg.anomalyScore * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
