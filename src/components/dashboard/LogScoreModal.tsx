import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Award, Calendar, Flag, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface LogScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, date: string, courseName: string, editId?: string) => Promise<{ success: boolean; error?: string }>;
  editItem?: {
    id: string;
    score: number;
    date: string;
    courseName?: string;
  } | null;
  currentCount?: number;
}

export const LogScoreModal: React.FC<LogScoreModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  currentCount = 0,
}) => {
  const isEditing = Boolean(editItem);
  const [score, setScore] = useState<number | ''>(38);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [courseName, setCourseName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setScore(editItem.score);
        setDate(editItem.date);
        setCourseName(editItem.courseName || '');
      } else {
        setScore(38);
        setDate(new Date().toISOString().split('T')[0]);
        setCourseName('');
      }
      setError(null);
      setSuccess(null);
      setIsSubmitting(false);
    }
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numScore = Number(score);
    if (score === '' || isNaN(numScore) || !Number.isInteger(numScore)) {
      setError('Score must be a whole integer between 1 and 45 points.');
      return;
    }

    if (numScore < 1 || numScore > 45) {
      setError('Score must be between 1 and 45 points.');
      return;
    }

    if (!date) {
      setError('A valid date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit(
        numScore,
        date,
        courseName.trim() || 'Verified Course Round',
        editItem?.id
      );

      if (res.success) {
        setSuccess(
          isEditing
            ? 'Score updated successfully!'
            : 'Round recorded! Your latest 5 scores have been updated.'
        );
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setError(res.error || 'Failed to record round.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-elevated border border-sand-200 text-left relative my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal text-charcoal">
                {isEditing ? 'Edit Stableford Round' : 'Record Stableford Round'}
              </h3>
              <p className="text-[11px] text-charcoal-muted font-medium">Valid score range: 1–45 points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-sand-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-score rolling notice when adding a 6th */}
        {!isEditing && currentCount >= 5 && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <strong>Your score history is full (5/5).</strong> Adding this new round will automatically replace your oldest stored score.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stableford Score */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Stableford Points (1–45)
              </label>
              <span className="text-[11px] text-charcoal-muted">Sports score</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                <Award className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                max="45"
                step="1"
                value={score}
                onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-sand-50/50 border border-sand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Round Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                Round Date
              </label>
              <span className="text-[10px] text-charcoal-muted">One score per date</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-sand-50/50 border border-sand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Golf Course Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Golf Course / Club Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-light">
                <Flag className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Wentworth West Course"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-sand-50/50 border border-sand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'SAVE CHANGES' : 'RECORD ROUND'}</span>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
