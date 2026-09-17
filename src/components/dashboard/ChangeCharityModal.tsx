import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import { FEATURED_CHARITIES } from '../../data/content';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ChangeCharityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharityId: string;
  currentPledgePercent: number;
  planPrice: number;
  planBilling: string;
  onSave: (charityId: string, pledgePercent: number) => Promise<{ success: boolean; error?: string }>;
}

const PERCENTAGE_OPTIONS = [10, 15, 20, 25, 30, 50, 75, 100];

export const ChangeCharityModal: React.FC<ChangeCharityModalProps> = ({
  isOpen,
  onClose,
  currentCharityId,
  currentPledgePercent,
  planPrice,
  planBilling,
  onSave,
}) => {
  const [selectedCharityId, setSelectedCharityId] = useState(currentCharityId);
  const [selectedPercent, setSelectedPercent] = useState(currentPledgePercent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const monthlyBase = planBilling === 'year' ? planPrice / 12 : planPrice;
  const calculatedMonthlyAllocation = (monthlyBase * (selectedPercent / 100)).toFixed(2);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const res = await onSave(selectedCharityId, selectedPercent);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to update charity selection.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving charity selection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated border border-sand-200 text-left my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-700">
                <Heart className="w-5 h-5 fill-sage-600" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-normal text-charcoal">
                  Change Designated Charity
                </h3>
                <p className="text-xs text-charcoal-muted">
                  Your subscription directly powers community and athletic impact
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-charcoal-light hover:text-charcoal p-1.5 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Causes Selection */}
          <div className="space-y-4 mb-6">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light block">
              1. Select Your Supported Cause:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {FEATURED_CHARITIES.map((cause) => {
                const isSelected = selectedCharityId === cause.id;
                return (
                  <div
                    key={cause.id}
                    onClick={() => setSelectedCharityId(cause.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-sage-50/50 border-sage-600 shadow-sm ring-1 ring-sage-500/20'
                        : 'bg-white hover:bg-sand-50/40 border-sand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={cause.imageUrl}
                        alt={cause.name}
                        className="w-14 h-14 rounded-xl object-cover border border-sand-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="sage" className="text-[9px] font-mono py-0 px-2">
                            {cause.category}
                          </Badge>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-sage-800 font-mono flex items-center gap-1">
                              <Check className="w-3 h-3 text-sage-600" /> Active Cause
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-charcoal mt-1">{cause.name}</h4>
                        <p className="text-xs text-charcoal-muted line-clamp-1">{cause.summary}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contribution Percentage */}
          <div className="mb-6 pt-4 border-t border-sand-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light">
                2. Choose Contribution Ratio (Minimum 10%):
              </label>
              <span className="font-mono font-bold text-sage-800 text-sm">
                {selectedPercent}% of membership
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
              {PERCENTAGE_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSelectedPercent(pct)}
                  className={`py-2 px-1 text-center rounded-xl font-mono text-xs font-bold transition-all ${
                    selectedPercent === pct
                      ? 'bg-sage-700 text-white shadow-sm ring-2 ring-sage-300'
                      : 'bg-sand-100 text-charcoal hover:bg-sand-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Calculated Allocation Callout */}
            <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-charcoal-muted block">Your Selected Allocation:</span>
                <span className="font-bold text-charcoal">
                  ₹{calculatedMonthlyAllocation} / month allocated to your selected cause
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200 shrink-0">
                Charity Allocation Rule: Minimum 10% contribution
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sand-100">
            <div className="flex items-center gap-1.5 text-[11px] text-charcoal-muted">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Selection is securely persisted to your member profile in MongoDB</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>SAVE CHARITY SELECTION</span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
