import type { SimulationResult } from '@ahcf-cps/engine';
import type { CreateSimulationBody } from './schemas.js';

export interface StoredSimulation {
  id: string;
  context: CreateSimulationBody['context'];
  inputs: CreateSimulationBody['inputs'];
  result: SimulationResult;
  createdAt: string;
}

export interface SimulationStore {
  save(record: StoredSimulation): Promise<void>;
  get(id: string): Promise<StoredSimulation | undefined>;
  list(limit?: number): Promise<StoredSimulation[]>;
  clear(): Promise<void>;
}

/**
 * Store em memória — default no MVP.
 * O schema Prisma está em `apps/api/prisma/schema.prisma`; ao provisionar
 * Postgres e rodar `pnpm prisma migrate dev`, substitua por PrismaStore
 * (basta setar `DATABASE_URL`).
 */
export class InMemorySimulationStore implements SimulationStore {
  private readonly data = new Map<string, StoredSimulation>();

  async save(record: StoredSimulation): Promise<void> {
    this.data.set(record.id, record);
  }

  async get(id: string): Promise<StoredSimulation | undefined> {
    return this.data.get(id);
  }

  async list(limit = 50): Promise<StoredSimulation[]> {
    return [...this.data.values()]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}
