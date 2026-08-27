import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, Edit, Eye, MessageSquare, Shield } from 'lucide-react';
import { apiService } from '../services/api';
import { ReviewCase, VerdictType } from '../types';
import { VerdictBadge } from '../components/common/VerdictBadge';

export const HumanReviewQueuePage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewCase[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewCase | null>(null);
  const [overrideVerdict, setOverrideVerdict] = useState<VerdictType>('SUSPICIOUS');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await apiService.getReviews();
        setReviews(res.reviews);
      } catch (err) {
        console.error('Error fetching review queue', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleSaveReview = async () => {
    if (!selectedReview) return;

    await apiService.updateReview(selectedReview.id, {
      status: 'VERIFIED',
      reviewerVerdict: overrideVerdict,
      notes,
      reviewerName: 'Dr. Sarah Vance'
    });

    setReviews(
      reviews.map((r) =>
        r.id === selectedReview.id
          ? { ...r, status: 'VERIFIED', reviewerVerdict: overrideVerdict, notes }
          : r
      )
    );

    setSelectedReview(null);
  };

  return (
    <div className="space-y-6 py-4 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            HUMAN-IN-THE-LOOP REVIEW QUEUE
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Expert human overrides for borderline, high-risk or contested AI deepfake verdicts
          </p>
        </div>
      </div>

      {/* Review Cases Table */}
      <div className="glass-panel p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">REVIEW ID</th>
                <th className="py-3 px-4">CASE ID</th>
                <th className="py-3 px-4">MEDIA FILE</th>
                <th className="py-3 px-4">AI VERDICT</th>
                <th className="py-3 px-4">HUMAN VERDICT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-600">{rev.id}</td>
                  <td className="py-3 px-4 text-blue-600 font-bold">{rev.caseId}</td>
                  <td className="py-3 px-4 text-slate-800 max-w-xs truncate font-sans font-medium">
                    {rev.caseData?.title || 'Profile Photo Submission'}
                  </td>
                  <td className="py-3 px-4">
                    {rev.caseData?.verdict ? <VerdictBadge verdict={rev.caseData.verdict} size="sm" /> : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {rev.reviewerVerdict ? <VerdictBadge verdict={rev.reviewerVerdict} size="sm" /> : <span className="text-slate-400 font-bold">PENDING</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rev.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 animate-pulse'
                    }`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      to={`/evidence/${rev.caseId}`}
                      className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all text-[11px] font-bold"
                    >
                      EVIDENCE
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedReview(rev);
                        setOverrideVerdict(rev.reviewerVerdict || rev.caseData?.verdict || 'SUSPICIOUS');
                        setNotes(rev.notes || '');
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all text-[11px] font-bold"
                    >
                      REVIEW / OVERRIDE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel-glow p-6 rounded-2xl border border-indigo-300 bg-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" /> HUMAN REVIEW OVERRIDE: {selectedReview.caseId}
              </h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Set Final Human Verdict:</label>
                <select
                  value={overrideVerdict}
                  onChange={(e) => setOverrideVerdict(e.target.value as VerdictType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold focus:border-blue-600"
                >
                  <option value="AUTHENTIC">AUTHENTIC</option>
                  <option value="SUSPICIOUS">SUSPICIOUS</option>
                  <option value="MANIPULATED">MANIPULATED</option>
                  <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Reviewer Forensic Notes:</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed forensic rationale for verdict override..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-sans font-medium focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-600 hover:text-slate-900 font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveReview}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:brightness-110 shadow-md shadow-indigo-500/20"
              >
                SAVE & APPROVE OVERRIDE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
