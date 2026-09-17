import React from 'react';
import { Check } from 'lucide-react';

interface MembershipProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const STEPS = [
  { step: 1, label: 'MEMBERSHIP', shortLabel: 'Plan' },
  { step: 2, label: 'ACCOUNT', shortLabel: 'Account' },
  { step: 3, label: 'CHARITY', shortLabel: 'Charity' },
  { step: 4, label: 'PAYMENT', shortLabel: 'Payment' },
  { step: 5, label: 'WELCOME', shortLabel: 'Welcome' },
];

export const MembershipProgress: React.FC<MembershipProgressProps> = ({ currentStep }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4">
      {/* Desktop / Tablet Full Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting background hairline */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-sand-200 -z-0" />
        
        {/* Active progress hairline */}
        <div
          className="absolute top-4 left-6 h-[2px] bg-sage-600 transition-all duration-500 -z-0"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep;
          const isActive = s.step === currentStep;

          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-sage-600 text-white shadow-sm ring-4 ring-background'
                    : isActive
                    ? 'bg-charcoal text-white ring-4 ring-sage-100 shadow-card scale-110'
                    : 'bg-sand-100 text-charcoal-light border border-sand-300/80 ring-4 ring-background'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `0${s.step}`}
              </div>
              <span
                className={`text-[11px] tracking-wider uppercase font-semibold mt-2.5 transition-colors ${
                  isActive
                    ? 'text-charcoal font-extrabold'
                    : isCompleted
                    ? 'text-sage-800'
                    : 'text-charcoal-light'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="sm:hidden flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-sand-200 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-charcoal text-white font-mono font-bold text-xs flex items-center justify-center">
            0{currentStep}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-charcoal-light font-bold">
              Step {currentStep} of 5
            </p>
            <p className="text-xs font-bold text-charcoal">
              {STEPS.find((s) => s.step === currentStep)?.label}
            </p>
          </div>
        </div>

        {/* Mini progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.step === currentStep
                  ? 'w-5 bg-charcoal'
                  : s.step < currentStep
                  ? 'w-3 bg-sage-600'
                  : 'w-1.5 bg-sand-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
