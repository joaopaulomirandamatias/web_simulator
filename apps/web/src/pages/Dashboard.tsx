import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ScoreRadar } from '../components/ScoreRadar.tsx';
import { useTranslations } from '../i18n/useI18n.ts';
import { summarizeHistory } from '../lib/analytics.ts';
import { useSimulationStore } from '../store/simulation.ts';

const methodColors: Record<string, string> = {
  conventional: '#475569',
  parameterized: '#0ea5e9',
  pbd: '#16a34a',
  kinesthetic: '#22c55e',
  xr: '#f59e0b',
  shared_control: '#2563eb',
};

export function Dashboard() {
  const t = useTranslations();
  const history = useSimulationStore((s) => s.history);
  const stats = summarizeHistory(history);

  if (history.length === 0) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-bold text-industrial-primary">
          {t.dashboard.title}
        </h1>
        <p className="mt-2 text-slate-600">{t.dashboard.empty}</p>
        <Link to="/simulate" className="btn-primary mt-4 inline-flex">
          {t.home.ctaNew}
        </Link>
      </div>
    );
  }

  const methodData = stats.byMethod.map((m) => ({
    method: t.methods[m.method],
    count: m.count,
    color: methodColors[m.method] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-industrial-primary">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-slate-500">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-3">
            <div className="text-xs uppercase text-slate-500">{t.dashboard.totalCard}</div>
            <div className="text-3xl font-bold text-industrial-primary">{stats.total}</div>
          </div>
          <div className="card px-5 py-3">
            <div className="text-xs uppercase text-slate-500">
              {t.dashboard.averageAdequacy}
            </div>
            <div className="text-3xl font-bold text-industrial-accent">
              {(stats.averageAdequacy * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card h-80">
          <h2 className="text-base font-semibold text-industrial-primary">
            {t.dashboard.methodDistribution}
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={methodData} layout="vertical" margin={{ left: 24, right: 24 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis
                dataKey="method"
                type="category"
                width={180}
                tick={{ fill: '#0F172A', fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {methodData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <ScoreRadar dimensions={stats.averageDimensions} />
      </div>

      <section className="card">
        <h2 className="text-base font-semibold text-industrial-primary">
          {t.dashboard.bySector}
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">{t.dashboard.sectorColumn}</th>
                <th className="py-2 pr-4">{t.dashboard.totalColumn}</th>
                <th className="py-2 pr-4">{t.dashboard.topMethodColumn}</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySector.map((bucket) => {
                const top = (Object.entries(bucket.byMethod) as [
                  keyof typeof bucket.byMethod,
                  number,
                ][]).sort((a, b) => b[1] - a[1])[0];
                return (
                  <tr key={bucket.sector} className="border-t border-slate-200">
                    <td className="py-2 pr-4 font-medium text-industrial-primary">
                      {bucket.sector === 'unspecified'
                        ? t.dashboard.unspecified
                        : t.sectors[bucket.sector]}
                    </td>
                    <td className="py-2 pr-4">{bucket.total}</td>
                    <td className="py-2 pr-4">
                      {top ? `${t.methods[top[0]]} (${top[1]})` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="text-base font-semibold text-industrial-primary">
          {t.dashboard.byStrategy}
        </h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {stats.byStrategy.map((s) => (
            <li
              key={s.strategy}
              className="rounded-xl2 border border-slate-200 p-3 flex justify-between"
            >
              <span className="text-slate-700">{s.strategy}</span>
              <span className="font-semibold text-industrial-primary">{s.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
