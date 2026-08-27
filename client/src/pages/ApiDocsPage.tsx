import React, { useEffect, useState } from 'react';
import { Code2, Key, Terminal, Send, Chrome, Bot, Copy, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { ApiKey } from '../types';

export const ApiDocsPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadKeys() {
      try {
        const res = await apiService.getApiKeys();
        setKeys(res.keys);
      } catch (err) {
        console.error('Error fetching API keys', err);
      }
    }
    loadKeys();
  }, []);

  const handleGenerateKey = async () => {
    if (!newKeyName) return;
    const res = await apiService.createApiKey(newKeyName);
    setKeys([...keys, res.key]);
    setGeneratedSecret(res.secret);
    setNewKeyName('');
  };

  const codeSnippet = `import requests

url = "http://localhost:5000/api/analyze"
headers = {
    "Authorization": "Bearer YOUR_VERIFRAME_API_KEY"
}
files = {
    "mediaFile": open("suspicious_video.mp4", "rb")
}

response = requests.post(url, headers=headers, files=files)
print(response.json())`;

  return (
    <div className="space-y-8 py-4 font-mono">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Code2 className="w-6 h-6 text-blue-600" />
          DEVELOPER API & INTEGRATIONS
        </h1>
        <p className="text-xs text-slate-500 font-semibold">Integrate VERIFRAME deepfake detection into your automated pipelines & bots</p>
      </div>

      {/* API Key Management Card */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-blue-700 flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-600" /> API KEY MANAGEMENT
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Key label (e.g. Production FactCheck Bot)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-medium focus:border-blue-600"
          />
          <button
            onClick={handleGenerateKey}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:brightness-110 shadow-md shadow-blue-500/20"
          >
            GENERATE NEW API KEY
          </button>
        </div>

        {generatedSecret && (
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-lg space-y-2 text-xs">
            <span className="text-emerald-800 font-bold block">NEW SECRET KEY GENERATED (Copy now, will not be shown again):</span>
            <div className="flex items-center justify-between bg-white p-2.5 rounded border border-emerald-200 font-mono text-emerald-700 font-bold">
              <span className="break-all">{generatedSecret}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedSecret);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-1 hover:text-emerald-900"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <span className="text-xs text-slate-500 block font-bold">ACTIVE KEYS</span>
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-900 font-bold block">{k.name}</span>
                  <span className="text-slate-500 text-[11px] font-semibold">{k.keyPrefix} • Created {new Date(k.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="text-blue-700 font-bold">{k.usageCount} Requests</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Snippet Panel */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" /> API REQUEST EXAMPLE (PYTHON)
        </h3>
        <pre className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-xs text-cyan-300 overflow-x-auto shadow-inner">
          {codeSnippet}
        </pre>
      </div>

      {/* PLANNED INTEGRATION CARDS */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900">PLANNED ECOSYSTEM INTEGRATIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Chrome className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Chrome Extension</h4>
            <p className="text-xs text-slate-600 font-sans font-medium">Right-click any web image or video to run instant VERIFRAME background analysis.</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Telegram Bot</h4>
            <p className="text-xs text-slate-600 font-sans font-medium">Forward audio notes or video clips to @VeriframeBot for instant deepfake reports.</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">WhatsApp Bot</h4>
            <p className="text-xs text-slate-600 font-sans font-medium">Designed specifically for elderly & low-digital-literacy users to flag viral misinformation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
