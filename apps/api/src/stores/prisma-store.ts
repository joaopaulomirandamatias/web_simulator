import type { SimulationStore, StoredSimulation } from '../store.js';

/**
 * Interface mínima do client gerado pelo Prisma — evita dependência de tipos
 * gerados em tempo de typecheck (útil quando `prisma generate` ainda não rodou).
 */
interface PrismaLikeClient {
  simulation: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    findUnique: (args: { where: { id: string } }) => Promise<unknown>;
    findMany: (args: { orderBy?: unknown; take?: number }) => Promise<unknown[]>;
    deleteMany: () => Promise<unknown>;
  };
  $disconnect?: () => Promise<void>;
}

/**
 * PrismaSimulationStore — usado quando `STORE_BACKEND=prisma` e
 * `DATABASE_URL` aponta para um Postgres provisionado.
 *
 * Passos:
 *   docker compose up -d postgres
 *   cp .env.example .env
 *   pnpm --filter @ahcf-cps/api prisma:generate
 *   pnpm --filter @ahcf-cps/api prisma:migrate
 *   STORE_BACKEND=prisma pnpm dev:api
 */
export class PrismaSimulationStore implements SimulationStore {
  constructor(private readonly prisma: PrismaLikeClient) {}

  async save(record: StoredSimulation): Promise<void> {
    await this.prisma.simulation.create({
      data: {
        id: record.id,
        createdAt: new Date(record.createdAt),
        sector: record.context?.sector ?? null,
        context: (record.context ?? {}) as object,
        inputs: record.inputs as object,
        result: record.result as unknown as object,
        recommended: record.result.recommended,
        strategy: record.result.strategy,
        engineVersion: record.result.engineVersion,
      },
    });
  }

  async get(id: string): Promise<StoredSimulation | undefined> {
    const row = (await this.prisma.simulation.findUnique({ where: { id } })) as
      | PrismaRow
      | null;
    return row ? toStored(row) : undefined;
  }

  async list(limit = 50): Promise<StoredSimulation[]> {
    const rows = (await this.prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 500),
    })) as PrismaRow[];
    return rows.map(toStored);
  }

  async clear(): Promise<void> {
    await this.prisma.simulation.deleteMany();
  }
}

interface PrismaRow {
  id: string;
  createdAt: Date;
  context: unknown;
  inputs: unknown;
  result: unknown;
}

function toStored(row: PrismaRow): StoredSimulation {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    context: row.context as StoredSimulation['context'],
    inputs: row.inputs as StoredSimulation['inputs'],
    result: row.result as StoredSimulation['result'],
  };
}

/**
 * Fábrica assíncrona do store: importa `@prisma/client` dinamicamente para
 * não falhar o bundle quando o client ainda não foi gerado.
 */
export async function createPrismaStore(): Promise<SimulationStore> {
  const mod = await import('@prisma/client').catch(() => {
    throw new Error(
      'STORE_BACKEND=prisma mas @prisma/client não está disponível. ' +
        'Rode `pnpm --filter @ahcf-cps/api prisma:generate` primeiro.',
    );
  });
  const Client = (mod as unknown as { PrismaClient: new () => PrismaLikeClient })
    .PrismaClient;
  return new PrismaSimulationStore(new Client());
}
