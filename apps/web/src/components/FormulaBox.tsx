import type { ReactNode } from 'react';

/**
 * Pequenos helpers tipográficos para fórmulas. Usamos HTML puro com CSS
 * (fontes matemáticas como "Cambria Math" / "STIX Two Math") para evitar
 * dependência de KaTeX/MathJax.
 */

export const Var = ({ children }: { children: ReactNode }) => (
  <span className="formula-var">{children}</span>
);

export const Sub = ({ children }: { children: ReactNode }) => (
  <span className="formula-sub">{children}</span>
);

export const Sup = ({ children }: { children: ReactNode }) => (
  <span className="formula-sup">{children}</span>
);

export const Op = ({ children }: { children: ReactNode }) => (
  <span className="formula-op">{children}</span>
);

export const Const = ({ children }: { children: ReactNode }) => (
  <span className="formula-const">{children}</span>
);

export const Sigma = ({ from, to }: { from?: ReactNode; to?: ReactNode }) => (
  <span className="formula-sigma" aria-hidden="true">
    {to ? <small>{to}</small> : null}
    <span>Σ</span>
    {from ? <small>{from}</small> : null}
  </span>
);

interface FormulaBoxProps {
  title?: ReactNode;
  caption?: ReactNode;
  children: ReactNode;
}

export function FormulaBox({ title, caption, children }: FormulaBoxProps) {
  return (
    <figure className="formula-box" aria-label={typeof title === 'string' ? title : undefined}>
      {title && (
        <figcaption className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </figcaption>
      )}
      <div className="formula-line" role="math">
        {children}
      </div>
      {caption && <div className="mt-1 text-xs text-slate-500">{caption}</div>}
    </figure>
  );
}

interface FormulaLegendProps {
  items: Array<{ term: ReactNode; description: ReactNode }>;
}

export function FormulaLegend({ items }: FormulaLegendProps) {
  return (
    <dl className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-slate-700">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <dt className="formula-line min-w-[64px] justify-start text-sm leading-tight">
            {item.term}
          </dt>
          <dd className="flex-1 leading-snug">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
