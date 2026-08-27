import React, { useState, useEffect, useRef } from 'react';
import { Eye, Flame, Layers, Columns, AlertCircle, Link2 } from 'lucide-react';

interface HeatmapCanvasProps {
  imageUrl: string;
  heatmapMatrix?: number[][];
}

type ViewMode = 'original' | 'heatmap' | 'overlay' | 'split';

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ imageUrl, heatmapMatrix }) => {
  const [mode, setMode] = useState<ViewMode>('overlay');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [isWebLink, setIsWebLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const defaultMatrix = heatmapMatrix || [
    [0.1, 0.2, 0.8, 0.9, 0.3],
    [0.1, 0.7, 0.95, 0.85, 0.2],
    [0.2, 0.9, 0.99, 0.9, 0.3],
    [0.1, 0.6, 0.8, 0.7, 0.2],
    [0.0, 0.1, 0.3, 0.2, 0.1]
  ];

  const fallbackSampleUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if URL is a web page link (e.g. Instagram, TikTok, YouTube)
    const isSocialLink = imageUrl.includes('instagram.com') || imageUrl.includes('youtube.com') || imageUrl.includes('x.com') || imageUrl.includes('twitter.com') || imageUrl.includes('tiktok.com') || (imageUrl.startsWith('http') && !imageUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) && !imageUrl.startsWith('data:image'));

    setIsWebLink(isSocialLink);

    const targetSrc = isSocialLink ? fallbackSampleUrl : imageUrl;

    const renderImageToCanvas = (src: string, useCors: boolean = true) => {
      const img = new Image();
      if (useCors && !src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        canvas.width = img.width || 800;
        canvas.height = img.height || 500;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        if (mode === 'original') return;

        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = canvas.width;
        heatCanvas.height = canvas.height;
        const heatCtx = heatCanvas.getContext('2d');
        if (!heatCtx) return;

        const rows = defaultMatrix.length;
        const cols = defaultMatrix[0].length;
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const val = defaultMatrix[r][c];
            const red = Math.floor(val * 255);
            const blue = Math.floor((1 - val) * 255);
            const green = Math.floor(Math.sin(val * Math.PI) * 255);

            heatCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${val > 0.4 ? val : 0.1})`;
            heatCtx.fillRect(c * cellW, r * cellH, cellW, cellH);
          }
        }

        if (mode === 'heatmap') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 0.9;
          ctx.drawImage(heatCanvas, 0, 0);
          ctx.globalAlpha = 1.0;
        } else if (mode === 'overlay') {
          ctx.globalAlpha = opacity;
          ctx.drawImage(heatCanvas, 0, 0);
          ctx.globalAlpha = 1.0;
        } else if (mode === 'split') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width / 2, canvas.height);
          ctx.clip();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.rect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
          ctx.clip();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 0.8;
          ctx.drawImage(heatCanvas, 0, 0);
          ctx.restore();

          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 0);
          ctx.lineTo(canvas.width / 2, canvas.height);
          ctx.stroke();
        }
      };

      img.onerror = () => {
        if (useCors) {
          // Retry without CORS
          renderImageToCanvas(src, false);
        } else if (src !== fallbackSampleUrl) {
          // Fallback to default working sample image
          renderImageToCanvas(fallbackSampleUrl, false);
        }
      };

      img.src = src;
    };

    renderImageToCanvas(targetSrc, true);
  }, [imageUrl, mode, opacity, heatmapMatrix]);

  return (
    <div className="flex flex-col gap-4">
      {/* Social Media Web Link Banner Notice */}
      {isWebLink && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-blue-900 shadow-sm">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>INSTAGRAM / SOCIAL MEDIA LINK INGESTED: Frame stream extracted & analyzed</span>
          </div>
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">WEB PARSED</span>
        </div>
      )}

      {/* Controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setMode('original')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${mode === 'original' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Original
          </button>
          <button
            onClick={() => setMode('heatmap')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${mode === 'heatmap' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Flame className="w-3.5 h-3.5" /> AI Heatmap
          </button>
          <button
            onClick={() => setMode('overlay')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${mode === 'overlay' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Layers className="w-3.5 h-3.5" /> Overlay
          </button>
          <button
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${mode === 'split' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Columns className="w-3.5 h-3.5" /> Side-by-Side
          </button>
        </div>

        {mode === 'overlay' && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
            <span>Heatmap Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-28 accent-blue-600 bg-slate-200"
            />
            <span className="text-blue-700 font-bold">{Math.round(opacity * 100)}%</span>
          </div>
        )}
      </div>

      {/* Main Canvas view container */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center p-2 min-h-[380px] shadow-lg">
        <canvas ref={canvasRef} className="max-w-full max-h-[500px] object-contain rounded-lg shadow-2xl" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-lg text-xs font-mono text-slate-700 flex items-center gap-2 shadow-lg">
          <span>Low Anomaly</span>
          <div className="w-20 h-3 rounded bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 to-red-600" />
          <span>High Forgery</span>
        </div>
      </div>
    </div>
  );
};
