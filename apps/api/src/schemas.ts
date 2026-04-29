import { SECTOR_IDS } from '@ahcf-cps/engine';
import { z } from 'zod';

const likert = z.number().int().min(1).max(5);

export const SimulationInputSchema = z.object({
  taskComplexity: likert,
  variability: likert,
  operatorExperience: likert,
  safetyRequired: likert,
  ergonomicLoad: likert,
  resourcesAvailable: likert,
  productivityGoal: likert,
  costConstraint: likert,
  leadershipPreference: likert,
  transparencyNeed: likert,
});

export const SimulationContextSchema = z.object({
  sector: z.enum(SECTOR_IDS as [string, ...string[]]).optional(),
  process: z.string().min(1).max(120).optional(),
  taskType: z.string().min(1).max(120).optional(),
  operators: z.number().int().min(0).max(1_000).optional(),
  cobotModel: z.string().min(1).max(120).optional(),
  productionVolume: z.string().min(1).max(120).optional(),
  lotType: z.enum(['HMLV', 'HVLM', 'mixed']).optional(),
});

export const CreateSimulationSchema = z.object({
  context: SimulationContextSchema.optional(),
  inputs: SimulationInputSchema,
  strategy: z.enum(['linear', 'ahp', 'topsis']).optional(),
  /** Quando true, retorna um `result.trace` com o passo-a-passo do cálculo. */
  trace: z.boolean().optional(),
});

export type CreateSimulationBody = z.infer<typeof CreateSimulationSchema>;
