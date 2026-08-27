import React from 'react';
import { Shield, Github, Twitter, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100/80 border-t border-slate-200 text-slate-600 font-mono text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-extrabold text-lg text-slate-900 tracking-wider">VERIFRAME</span>
          </div>
          <p className="text-slate-600 text-xs font-sans max-w-sm leading-relaxed">
            Verify what you see. Trust what you share. Multimodal AI verification platform for image, video, audio, and C2PA metadata authenticity.
          </p>
          <div className="flex items-center gap-3 text-slate-500 pt-2">
            <a href="#" className="hover:text-blue-600 transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-blue-600 transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-blue-600 transition-colors"><Lock className="w-4 h-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase mb-3 text-xs tracking-wider">Product</h4>
          <ul className="space-y-2 text-slate-600 font-sans">
            <li><Link to="/analyze" className="hover:text-blue-600 transition-colors">Analyze Media</Link></li>
            <li><Link to="/dashboard" className="hover:text-blue-600 transition-colors">SOC Dashboard</Link></li>
            <li><Link to="/cases" className="hover:text-blue-600 transition-colors">Case History</Link></li>
            <li><Link to="/review" className="hover:text-blue-600 transition-colors">Human Review Queue</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase mb-3 text-xs tracking-wider">Technology</h4>
          <ul className="space-y-2 text-slate-600 font-sans">
            <li><a href="#" className="hover:text-blue-600 transition-colors">XceptionNet & ViT Models</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">C2PA Manifest Verification</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Audio Spectral Analysis</a></li>
            <li><Link to="/api-docs" className="hover:text-blue-600 transition-colors">REST API Docs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase mb-3 text-xs tracking-wider">Security & Legal</h4>
          <ul className="space-y-2 text-slate-600 font-sans">
            <li><Link to="/help" className="hover:text-blue-600 transition-colors">Ethical AI Statement</Link></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Security SOC</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[11px]">
        <p>© 2026 VERIFRAME Security Inc. All rights reserved. Hackathon Problem Statement 4 Submission.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-1 font-bold">
          <span>Encrypted with SHA-256 & TLS 1.3</span>
        </p>
      </div>
    </footer>
  );
};
