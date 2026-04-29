import type { HistoryEntry } from '../store/simulation.ts';

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Exporta o histórico local em CSV anonimizado (RF11).
 * Inclui coluna opcional `note` (rastreio, ex. teste com IA).
 */
export function exportHistoryToCsv(entries: HistoryEntry[]): Blob {
  const header = [
    'id',
    'createdAt',
    'note',
    'sector',
    'recommended',
    'engineVersion',
    'strategy',
    'taskComplexity',
    'variability',
    'operatorExperience',
    'safetyRequired',
    'ergonomicLoad',
    'resourcesAvailable',
    'productivityGoal',
    'costConstraint',
    'leadershipPreference',
    'transparencyNeed',
    'dim_safety',
    'dim_ergonomic',
    'dim_humanPreference',
    'dim_performance',
    'dim_taskComplexity',
  ].join(',');

  const rows = entries.map((e) => {
    const d = e.result.dimensions;
    return [
      csvCell(e.id),
      csvCell(e.createdAt),
      csvCell(e.note ?? ''),
      csvCell(e.context.sector ?? ''),
      csvCell(e.result.recommended),
      csvCell(e.result.engineVersion),
      csvCell(e.result.strategy),
      e.inputs.taskComplexity,
      e.inputs.variability,
      e.inputs.operatorExperience,
      e.inputs.safetyRequired,
      e.inputs.ergonomicLoad,
      e.inputs.resourcesAvailable,
      e.inputs.productivityGoal,
      e.inputs.costConstraint,
      e.inputs.leadershipPreference,
      e.inputs.transparencyNeed,
      d.safety.toFixed(4),
      d.ergonomic.toFixed(4),
      d.humanPreference.toFixed(4),
      d.performance.toFixed(4),
      d.taskComplexity.toFixed(4),
    ].join(',');
  });

  return new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exportação em PDF via `window.print()`.
 * O CSS define `@media print` que esconde header/footer/nav e formata
 * a tela de resultado como uma página A4. Evita dependências pesadas.
 */
export function exportAsPdf() {
  window.print();
}
