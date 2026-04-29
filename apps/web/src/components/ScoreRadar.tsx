import type { DimensionScores } from '@ahcf-cps/engine';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from '../i18n/useI18n.ts';

interface Props {
  dimensions: DimensionScores;
}

export function ScoreRadar({ dimensions }: Props) {
  const t = useTranslations();
  const data = [
    { dimension: t.dimensions.safety, value: +dimensions.safety.toFixed(2) },
    { dimension: t.dimensions.ergonomic, value: +dimensions.ergonomic.toFixed(2) },
    { dimension: t.dimensions.humanPreference, value: +dimensions.humanPreference.toFixed(2) },
    { dimension: t.dimensions.performance, value: +dimensions.performance.toFixed(2) },
    { dimension: t.dimensions.taskComplexity, value: +dimensions.taskComplexity.toFixed(2) },
  ];
  return (
    <div className="card h-80">
      <h3 className="text-base font-semibold text-industrial-primary">
        {t.common.dimensionsProfile}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={90}>
          <PolarGrid stroke="#CBD5E1" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#0F172A', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickCount={5} />
          <Radar
            dataKey="value"
            stroke="#2563EB"
            fill="#2563EB"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
