import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const WinningsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [winnings, setWinnings] = useState<any[]>([]);
  const [totalWon, setTotalWon] = useState(0);

  // Upload proof modal/form state
  const [isUploading, setIsUploading] = useState(false);
  const [proofInput, setProofInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchWinnings = async () => {
    try {
      const res = await api.draw.getMyWinnings();
      if (res.success) {
        setWinnings(res.winnings || []);
        setTotalWon(res.totalWon || 0);
      }
    } catch (err) {
      console.error('Error fetching winnings:', err);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, [user]);

  const handleSubmitProof = async (drawId: string) => {
    if (!proofInput || proofInput.trim().length === 0) {
      setUploadError('Please provide a valid image URL or screenshot link.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await api.draw.submitProof(proofInput.trim(), drawId);
      if (res.success) {
        setUploadSuccess(true);
        setProofInput('');
        await fetchWinnings();
      } else {
        setUploadError(res.message || 'Failed to submit verification proof.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error submitting proof.');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter for winning records
  const winningRecords = winnings.filter((w) => w.matchCount >= 3);
  const activeWinnerRecord = winningRecords[0] || null;

  return (
    <div className="min-h-screen bg-sand-50/50 flex flex-col font-sans text-charcoal">
      {/* Header Bar */}
      <header className="bg-white border-b border-sand-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-charcoal hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-serif font-bold text-sm tracking-tight text-charcoal">
              DIGITAL HEROES
            </span>
            <Badge variant="sage" className="text-[10px] font-mono py-0.5">
              MY WINNINGS
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
        {/* Title & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-gold-900 bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
              FEATURE 3 · PRIZE PAYOUTS & VERIFICATION
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal mt-2">
              My Winnings
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Track your draw prizes, verification status, and payout distribution.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-sand-200 shadow-sm text-right">
            <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block">
              TOTAL WON
            </span>
            <span className="font-mono text-2xl font-extrabold text-emerald-800">
              ₹{totalWon.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Active Winner Card */}
        {activeWinnerRecord ? (
          <div className="space-y-6">
            {/* Congratulations Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-gold-50 to-amber-50/70 border border-gold-200 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-200 text-gold-900 flex items-center justify-center font-extrabold shadow-sm">
                    <Trophy className="w-6 h-6 text-gold-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-gold-800 tracking-wider">
                      🎉 PRIZE WON
                    </span>
                    <h2 className="font-serif text-2xl font-normal text-charcoal">
                      Congratulations, {user?.fullName?.split(' ')[0] || 'Member'}!
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase font-bold text-charcoal-light block">
                    ALLOCATED PRIZE
                  </span>
                  <span className="font-mono text-3xl font-black text-emerald-900">
                    ₹{activeWinnerRecord.prizeAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Draw Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gold-200/60 text-xs">
                <div>
                  <span className="text-charcoal-muted block">Draw Cycle:</span>
                  <span className="font-bold text-charcoal">
                    {activeWinnerRecord.month} {activeWinnerRecord.year}
                  </span>
                </div>

                <div>
                  <span className="text-charcoal-muted block">Matches:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {activeWinnerRecord.matchCount} / 5 Numbers
                  </span>
                </div>

                <div>
                  <span className="text-charcoal-muted block">Verification:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                      activeWinnerRecord.verificationStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeWinnerRecord.verificationStatus === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : activeWinnerRecord.verificationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-sand-200 text-charcoal'
                    }`}
                  >
                    {activeWinnerRecord.verificationStatus === 'APPROVED' && 'Approved'}
                    {activeWinnerRecord.verificationStatus === 'PENDING' && 'Pending Review'}
                    {activeWinnerRecord.verificationStatus === 'REJECTED' && 'Rejected'}
                    {activeWinnerRecord.verificationStatus === 'NONE' && 'Verification Required'}
                  </span>
                </div>

                <div>
                  <span className="text-charcoal-muted block">Payment:</span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                      activeWinnerRecord.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeWinnerRecord.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Numbers Comparison */}
              <div className="mt-5 pt-4 border-t border-gold-200/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-xs">
                <div>
                  <span className="text-charcoal-muted font-mono uppercase text-[10px] block mb-1">
                    Your Lucky Numbers:
                  </span>
                  <div className="flex gap-1.5">
                    {activeWinnerRecord.luckyNumbers?.map((n: number) => {
                      const isMatch = activeWinnerRecord.winningNumbers?.includes(n);
                      return (
                        <span
                          key={n}
                          className={`font-mono text-xs font-bold px-2 py-1 rounded-lg ${
                            isMatch
                              ? 'bg-emerald-600 text-white font-extrabold ring-2 ring-emerald-300'
                              : 'bg-sand-100 text-charcoal'
                          }`}
                        >
                          {String(n).padStart(2, '0')}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-charcoal-muted font-mono uppercase text-[10px] block mb-1">
                    Official Winning Numbers:
                  </span>
                  <div className="flex gap-1.5">
                    {activeWinnerRecord.winningNumbers?.map((n: number) => (
                      <span
                        key={n}
                        className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-gold-200 text-charcoal"
                      >
                        {String(n).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Upload Section */}
            <Card className="p-6 sm:p-8 bg-white border-sand-200 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif text-xl font-normal text-charcoal">
                  Winner Verification Process
                </h3>
              </div>

              {activeWinnerRecord.verificationStatus === 'APPROVED' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">
                      Proof Verified and Approved!
                    </span>
                    <p className="mt-0.5 text-charcoal-muted">
                      Your eligibility has been audited and approved by the administrators. Payout
                      processing status is:{' '}
                      <strong className="text-charcoal font-mono">
                        {activeWinnerRecord.paymentStatus}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              ) : activeWinnerRecord.verificationStatus === 'PENDING' ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-sm">
                      Verification Pending Review
                    </span>
                    <p className="mt-0.5 text-charcoal-muted">
                      Your proof screenshot has been submitted and is currently being audited by the
                      compliance team. You will be notified once reviewed.
                    </p>
                    {activeWinnerRecord.proofUrl && (
                      <p className="mt-2 text-[11px] text-charcoal font-mono truncate">
                        Submitted proof URL: {activeWinnerRecord.proofUrl}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    According to the Digital Heroes PRD, winners of qualifying tiers must submit a
                    screenshot/proof of their golf score platform or course scorecard to complete
                    winner verification before payout distribution.
                  </p>

                  {uploadSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Proof submitted successfully! Status updated to Pending Review.</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light block">
                      Screenshot / Scorecard Proof URL:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="url"
                        placeholder="https://example.com/scorecard_proof.jpg or image link"
                        value={proofInput}
                        onChange={(e) => setProofInput(e.target.value)}
                        className="flex-grow px-4 py-2.5 rounded-xl border border-sand-300 text-xs font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isUploading}
                        onClick={() => handleSubmitProof(activeWinnerRecord.drawId)}
                        className="font-bold text-xs shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {isUploading ? 'Submitting...' : 'UPLOAD PROOF'}
                      </Button>
                    </div>
                    <p className="text-[11px] text-charcoal-light">
                      Accepts verified image URLs, cloud storage links, or course scorecard exports.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-sand-200 rounded-3xl shadow-card space-y-4 p-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sand-100 text-charcoal-muted flex items-center justify-center">
              <Trophy className="w-7 h-7 text-sage-600" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-normal text-charcoal">
                No Prize Winnings Yet
              </h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto mt-1 leading-relaxed">
                Choose and lock your 5 Lucky Numbers (1–99) to participate in the upcoming monthly
                draw. Matching 3, 4, or 5 numbers qualifies you for a share of the monthly prize pool!
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/draw')}
              className="font-bold text-xs"
            >
              GO TO MONTHLY DRAW
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
