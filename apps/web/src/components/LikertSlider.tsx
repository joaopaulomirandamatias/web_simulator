import type { SimulationInputs } from '@ahcf-cps/engine';
import clsx from 'clsx';
import { useId } from 'react';
import { useTranslations } from '../i18n/useI18n.ts';

interface Props {
  inputKey: keyof SimulationInputs;
  value: number;
  onChange: (value: number) => void;
}

export function LikertSlider({ inputKey, value, onChange }: Props) {
  const t = useTranslations();
  const meta = t.inputs.copy[inputKey];
  const hintId = useId();
  const valueId = useId();
  if (!meta) return null;
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-industrial-primary" id={`${hintId}-label`}>
            {meta.label}
          </h3>
          <p className="mt-1 text-sm text-slate-500" id={hintId}>
            {meta.hint}
          </p>
        </div>
        <span
          id={valueId}
          className="text-2xl font-bold text-industrial-accent"
          aria-live="polite"
          aria-label={`${meta.label}: ${value}`}
        >
          {value}
        </span>
      </div>
      <div
        className="mt-4 flex items-center gap-2"
        role="radiogroup"
        aria-labelledby={`${hintId}-label`}
        aria-describedby={hintId}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} ${n === 1 ? `(${meta.low})` : n === 5 ? `(${meta.high})` : ''}`}
            tabIndex={value === n ? 0 : -1}
            onClick={() => onChange(n)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange(Math.min(5, n + 1));
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange(Math.max(1, n - 1));
              }
            }}
            className={clsx(
              'flex-1 rounded-xl2 py-3 text-lg font-semibold transition border-2',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300',
              value === n
                ? 'bg-industrial-accent border-industrial-accent text-white shadow-industrial'
                : 'bg-white border-slate-200 text-slate-700 hover:border-industrial-accent',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{meta.low}</span>
        <span>{meta.high}</span>
      </div>
    </div>
  );
}
