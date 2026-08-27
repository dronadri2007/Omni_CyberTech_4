import React from 'react';
import { HelpCircle, BookOpen, ShieldCheck, Cpu, Layers } from 'lucide-react';

export const HelpLearnPage: React.FC = () => {
  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto font-mono">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          KNOWLEDGE BASE & DEEPFAKE EDUCATION
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Understanding AI detection scores, C2PA standards, and forensic methodologies</p>
      </div>

      <div className="space-y-6 text-xs">
        <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-3 font-sans shadow-sm">
          <h3 className="font-mono font-bold text-sm text-blue-700">1. How to Interpret the Authenticity Score</h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            The VERIFRAME Authenticity Score ranges from 0% to 100%. Scores above 80% indicate verified camera hardware capture or lack of generative neural artifacts. Scores below 30% indicate high probability of synthetic face swaps or AI voice synthesis.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-3 font-sans shadow-sm">
          <h3 className="font-mono font-bold text-sm text-indigo-700">2. What is C2PA Provenance?</h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            C2PA (Coalition for Content Provenance and Authenticity) is an open technical standard allowing photographers, newsrooms, and hardware manufacturers to cryptographically embed digital signatures directly into media files.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-3 font-sans shadow-sm">
          <h3 className="font-mono font-bold text-sm text-emerald-700">3. Understanding the Anomaly Heatmap</h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            The heatmap is an Error-Level-Analysis grid: the image is recompressed at a fixed quality and differenced against the original, so regions with unusual recompression residue — typical of splices or painted edits — light up. A trained model will later add gradient-based attention on top of this.
          </p>
        </div>
      </div>
    </div>
  );
};
