import { runSimulation, type SimulationInputs, type SectorId } from '@ahcf-cps/engine';
import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { CreateSimulationSchema } from '../schemas.js';
import type { SimulationStore } from '../store.js';

/**
 * Controla se a API aceita o flag `trace`. Deploys acadêmicos ativam
 * (default); deploys de produção/comunidade podem desligar para nunca
 * expor os números intermediários (basta `EXPLAIN_ENABLED=false`).
 */
function isExplainAllowed(env = process.env): boolean {
  return (env.EXPLAIN_ENABLED ?? 'true').toLowerCase() !== 'false';
}

export const simulationsRoute: FastifyPluginAsync<{
  store: SimulationStore;
}> = async (app, { store }) => {
  const allowExplain = isExplainAllowed();

  app.post('/', async (request, reply) => {
    const parsed = CreateSimulationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    const { inputs, context, strategy, trace } = parsed.data;
    const result = runSimulation(inputs as SimulationInputs, {
      strategy,
      sector: context?.sector as SectorId | undefined,
      trace: allowExplain && trace === true,
    });
    const record = {
      id: randomUUID(),
      context,
      inputs,
      result,
      createdAt: new Date().toISOString(),
    };
    await store.save(record);
    return reply.code(201).send(record);
  });

  app.get('/', async (request) => {
    const { limit } = request.query as { limit?: string };
    const n = Math.min(Math.max(Number(limit ?? 50), 1), 200);
    const items = await store.list(n);
    return { items };
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const item = await store.get(request.params.id);
    if (!item) return reply.notFound(`simulation ${request.params.id} not found`);
    return item;
  });
};

export const exportRoute: FastifyPluginAsync<{ store: SimulationStore }> = async (
  app,
  { store },
) => {
  app.get('/csv', async (_request, reply) => {
    const items = await store.list(500);
    const rows: string[] = [
      [
        'id',
        'createdAt',
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
      ].join(','),
    ];
    for (const entry of items) {
      const d = entry.result.dimensions;
      rows.push(
        [
          entry.id,
          entry.createdAt,
          entry.context?.sector ?? '',
          entry.result.recommended,
          entry.result.engineVersion,
          entry.result.strategy,
          entry.inputs.taskComplexity,
          entry.inputs.variability,
          entry.inputs.operatorExperience,
          entry.inputs.safetyRequired,
          entry.inputs.ergonomicLoad,
          entry.inputs.resourcesAvailable,
          entry.inputs.productivityGoal,
          entry.inputs.costConstraint,
          entry.inputs.leadershipPreference,
          entry.inputs.transparencyNeed,
          d.safety.toFixed(4),
          d.ergonomic.toFixed(4),
          d.humanPreference.toFixed(4),
          d.performance.toFixed(4),
          d.taskComplexity.toFixed(4),
        ].join(','),
      );
    }
    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="ahcf-cps-export.csv"')
      .send(rows.join('\n'));
  });
};
