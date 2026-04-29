import type { ProgrammingMethod, SectorId } from '@ahcf-cps/engine';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../i18n/useI18n.ts';
import { downloadBlob, exportHistoryToCsv } from '../lib/exporters.ts';
import { useSimulationStore } from '../store/simulation.ts';

type SectorFilter = SectorId | 'unspecified' | 'all';
type MethodFilter = ProgrammingMethod | 'all';
type StrategyFilter = string | 'all';

export function History() {
  const t = useTranslations();
  const { history, setResult, removeEntry, clearHistory } = useSimulationStore();

  const [sector, setSector] = useState<SectorFilter>('all');
  const [method, setMethod] = useState<MethodFilter>('all');
  const [strategy, setStrategy] = useState<StrategyFilter>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const availableSectors = useMemo(
    () =>
      Array.from(
        new Set(history.map((e) => (e.context.sector ?? 'unspecified') as SectorFilter)),
      ),
    [history],
  );
  const availableMethods = useMemo(
    () =>
      Array.from(new Set(history.map((e) => e.result.recommended))) as MethodFilter[],
    [history],
  );
  const availableStrategies = useMemo(
    () => Array.from(new Set(history.map((e) => e.result.strategy))),
    [history],
  );

  const filtered = useMemo(
    () =>
      history.filter((entry) => {
        const entrySector = (entry.context.sector ?? 'unspecified') as SectorFilter;
        if (sector !== 'all' && entrySector !== sector) return false;
        if (method !== 'all' && entry.result.recommended !== method) return false;
        if (strategy !== 'all' && entry.result.strategy !== strategy) return false;
        return true;
      }),
    [history, sector, method, strategy],
  );

  const resetFilters = () => {
    setSector('all');
    setMethod('all');
    setStrategy('all');
  };

  const handleExport = () => {
    downloadBlob(exportHistoryToCsv(filtered), 'ahcf-cps-history.csv');
  };

  const handleClear = () => {
    clearHistory();
    setConfirmOpen(false);
    resetFilters();
  };

  const renderSectorLabel = (id: SectorFilter) =>
    id === 'all' ? t.history.filters.all : id === 'unspecified' ? t.dashboard.unspecified : t.sectors[id];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-industrial-primary">{t.history.title}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-ghost disabled:opacity-50"
          >
            {t.history.exportCsv}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={history.length === 0}
            className="btn-ghost text-industrial-danger disabled:opacity-50"
          >
            {t.history.clearAll}
          </button>
          <Link to="/simulate" className="btn-primary">
            {t.history.newSim}
          </Link>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="card text-slate-500">{t.history.empty}</p>
      ) : (
        <>
          <section className="card">
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="block text-sm">
                <span className="text-slate-500">{t.history.filters.sector}</span>
                <select
                  className="mt-1 w-full rounded-xl2 border border-slate-200 px-3 py-2 bg-white"
                  value={sector}
                  onChange={(e) => setSector(e.target.value as SectorFilter)}
                >
                  <option value="all">{t.history.filters.all}</option>
                  {availableSectors.map((id) => (
                    <option key={id} value={id}>
                      {renderSectorLabel(id)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-500">{t.history.filters.method}</span>
                <select
                  className="mt-1 w-full rounded-xl2 border border-slate-200 px-3 py-2 bg-white"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as MethodFilter)}
                >
                  <option value="all">{t.history.filters.all}</option>
                  {availableMethods.map((id) => (
                    <option key={id} value={id}>
                      {t.methods[id as ProgrammingMethod]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-500">{t.history.filters.strategy}</span>
                <select
                  className="mt-1 w-full rounded-xl2 border border-slate-200 px-3 py-2 bg-white"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                >
                  <option value="all">{t.history.filters.all}</option>
                  {availableStrategies.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-ghost w-full text-sm py-2"
                >
                  {t.history.filters.clear}
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {t.history.filters.summary
                .replace('{shown}', String(filtered.length))
                .replace('{total}', String(history.length))}
            </p>
          </section>

          {filtered.length === 0 ? (
            <p className="card text-slate-500">{t.history.empty}</p>
          ) : (
            <div className="card divide-y divide-slate-200 p-0">
              {filtered.map((entry) => (
                <article key={entry.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-industrial-primary">
                      {t.methods[entry.result.recommended]}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.context.sector ? ` · ${t.sectors[entry.context.sector]}` : ''}
                      {` · ${entry.result.strategy}`}
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2" title={entry.note}>
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="chip hidden sm:inline-flex">
                      engine {entry.result.engineVersion}
                    </span>
                    <Link
                      to="/result"
                      onClick={() => setResult(entry.result)}
                      className="btn-ghost text-sm px-3 py-2"
                    >
                      {t.history.open}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      aria-label={t.history.delete}
                      className="rounded-xl2 bg-rose-50 px-3 py-2 text-sm text-industrial-danger hover:bg-rose-100"
                      title={t.history.delete}
                    >
                      ✕
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-confirm-title"
        >
          <div className="max-w-md w-full rounded-xl2 bg-white p-6 shadow-xl">
            <h2 id="clear-confirm-title" className="text-lg font-bold text-industrial-primary">
              {t.history.clearAll}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{t.history.clearConfirm}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="btn-ghost text-sm px-4 py-2"
              >
                {t.history.clearConfirmNo}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn-primary text-sm px-4 py-2 bg-industrial-danger hover:bg-rose-700"
              >
                {t.history.clearConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
