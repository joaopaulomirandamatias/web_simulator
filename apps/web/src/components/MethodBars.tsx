import type { MethodResult } from '@ahcf-cps/engine';
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
import { useTranslations } from '../i18n/useI18n.ts';

interface Props {
  ranking: MethodResult[];
}

const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#94A3B8', '#CBD5E1', '#E2E8F0'];

export function MethodBars({ ranking }: Props) {
  const t = useTranslations();
  const data = ranking.map((r, i) => ({
    method: t.methods[r.method],
    score: +r.normalized.toFixed(3),
    rank: i,
  }));
  return (
    <div className="card h-80">
      <h3 className="text-base font-semibold text-industrial-primary">{t.common.ranking}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 1]} tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis
            dataKey="method"
            type="category"
            width={180}
            tick={{ fill: '#0F172A', fontSize: 12 }}
          />
          <Tooltip formatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i] ?? '#CBD5E1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
