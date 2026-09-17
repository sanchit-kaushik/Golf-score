import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, Lock, AlertCircle, Loader2, Shuffle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface LuckyNumberPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNumbers: number[];
  isLocked: boolean;
  drawMonth: string;
  drawYear: number;
  onSave: (numbers: number[]) => Promise<{ success: boolean; error?: string }>;
  onLock?: () => Promise<{ success: boolean; error?: string }>;
}

export const LuckyNumberPickerModal: React.FC<LuckyNumberPickerModalProps> = ({
  isOpen,
  onClose,
  currentNumbers,
  isLocked,
  drawMonth,
  drawYear,
  onSave,
  onLock,
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync current numbers on open
  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(currentNumbers) && currentNumbers.length === 5) {
        setSelectedNumbers([...currentNumbers].sort((a, b) => a - b));
      } else {
        setSelectedNumbers([]);
      }
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentNumbers]);

  if (!isOpen) return null;

  const handleToggleNumber = (num: number) => {
    if (isLocked) return;
    setError(null);
    setSuccessMsg(null);

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 5) {
        setError('You can only select up to 5 Lucky Numbers. Deselect one first.');
        return;
      }
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleQuickPick = () => {
    if (isLocked) return;
    setError(null);
    setSuccessMsg(null);
    const generated = new Set<number>();
    while (generated.size < 5) {
      const rand = Math.floor(Math.random() * 99) + 1;
      generated.add(rand);
    }
    setSelectedNumbers(Array.from(generated).sort((a, b) => a - b));
  };

  const handleClear = () => {
    if (isLocked) return;
    setSelectedNumbers([]);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    if (selectedNumbers.length !== 5) {
      setError('Please select exactly 5 Lucky Numbers before saving.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const res = await onSave(selectedNumbers);
      if (res.success) {
        setSuccessMsg('Your 5 Lucky Numbers have been saved to your MongoDB profile.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to save Lucky Numbers.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving Lucky Numbers.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockNow = async () => {
    if (!onLock || selectedNumbers.length !== 5) return;
    if (!window.confirm("Are you sure you want to lock your Lucky Numbers for this month's draw? Once locked, they cannot be changed.")) {
      return;
    }

    setError(null);
    setIsLocking(true);
    try {
      const res = await onLock();
      if (res.success) {
        setSuccessMsg('Your Lucky Numbers are now locked for this month’s draw.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to lock numbers.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error locking numbers.');
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-elevated border border-sand-200 text-left my-6 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-700">
                <Sparkles className="w-5 h-5 fill-sage-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-normal text-charcoal">
                    Choose 5 Lucky Numbers
                  </h3>
                  <Badge variant={isLocked ? 'gold' : 'sage'} className="text-[10px] font-mono">
                    {drawMonth} {drawYear}
                  </Badge>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Pick your 5 numbers (1–99) for the monthly draw. Separate from golf scores.
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

          {/* Locked Status Notice */}
          {isLocked && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 shrink-0">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <strong>Numbers Locked:</strong> Your Lucky Numbers are locked for this month's draw and cannot be changed. Historical results remain immutable.
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-800 flex items-center gap-2 shrink-0">
              <Check className="w-4 h-4 text-sage-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Selection Tray: Exactly 5 Slots */}
          <div className="mb-4 p-4 rounded-2xl bg-sand-50/90 border border-sand-200 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal-light">
                  Your 5 Lucky Numbers:
                </span>
                <span className="font-mono text-xs font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md">
                  {selectedNumbers.length} / 5 selected
                </span>
              </div>

              {!isLocked && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickPick}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-700 hover:text-sage-900 bg-white px-2.5 py-1 rounded-lg border border-sand-200 hover:bg-sand-50 transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    Quick Pick 5
                  </button>
                  {selectedNumbers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-charcoal-light hover:text-charcoal bg-white px-2.5 py-1 rounded-lg border border-sand-200 hover:bg-sand-50 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 5 Number Badges */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4].map((index) => {
                const num = selectedNumbers[index];
                const hasNumber = num !== undefined;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (hasNumber && !isLocked) handleToggleNumber(num);
                    }}
                    className={`h-14 sm:h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      hasNumber
                        ? 'bg-sage-600 text-white border-sage-700 shadow-sm cursor-pointer hover:bg-sage-700'
                        : 'bg-white border-dashed border-sand-300 text-sand-400'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase opacity-75">
                      SLOT 0{index + 1}
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-extrabold">
                      {hasNumber ? (num < 10 ? `0${num}` : num) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1–99 Numbers Grid (Scrollable Container) */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-[220px]">
            <div className="mb-2 flex items-center justify-between text-[11px] text-charcoal-light">
              <span>Select 5 numbers from 1 to 99:</span>
              <span>Click a number to select / deselect</span>
            </div>

            <div className="grid grid-cols-9 sm:grid-cols-11 gap-1.5 p-2 bg-sand-50/50 rounded-2xl border border-sand-100">
              {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => {
                const isSelected = selectedNumbers.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleToggleNumber(n)}
                    className={`h-9 sm:h-10 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-sage-700 text-white shadow-sm ring-2 ring-sage-300 scale-105 z-10'
                        : isLocked
                        ? 'bg-sand-100 text-sand-400 cursor-not-allowed opacity-60'
                        : 'bg-white text-charcoal border border-sand-200 hover:border-sage-400 hover:bg-sand-50'
                    }`}
                  >
                    {n < 10 ? `0${n}` : n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-4 border-t border-sand-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-charcoal-muted flex items-center gap-1.5">
              <span>💡 Multiple subscribers can choose the same numbers. Prize pools are split equally.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSaving || isLocking}
                className="w-full sm:w-auto"
              >
                Close
              </Button>

              {!isLocked && (
                <>
                  {onLock && selectedNumbers.length === 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLockNow}
                      disabled={isSaving || isLocking}
                      className="w-full sm:w-auto text-amber-800 border-amber-300 hover:bg-amber-50"
                    >
                      {isLocking ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      <span>Lock Selection</span>
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || isLocking || selectedNumbers.length !== 5}
                    className="w-full sm:w-auto min-w-[170px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        <span>Saving Numbers...</span>
                      </>
                    ) : (
                      <span>SAVE 5 LUCKY NUMBERS</span>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
