import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import { readAiConfig, type AiConfig, type chatCompletion } from './ai/openrouter.js';
import { readAuthConfig, registerAuth, type AuthConfig } from './auth.js';
import { aiRoute } from './routes/ai.js';
import { authRoute, InMemoryUserStore } from './routes/auth.js';
import { exportRoute, simulationsRoute } from './routes/simulations.js';
import { InMemorySimulationStore, type SimulationStore } from './store.js';

export interface BuildOptions {
  corsOrigin?: string | string[] | boolean;
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  store?: SimulationStore;
  auth?: AuthConfig;
  users?: InMemoryUserStore;
  ai?: AiConfig;
  /** Injeção para testes: substitui a chamada real ao OpenRouter. */
  chatFn?: typeof chatCompletion;
}

export async function buildServer(options: BuildOptions = {}) {
  const app = Fastify({
    logger: {
      level: options.logLevel ?? 'info',
    },
  });

  await app.register(sensible);
  await app.register(cors, {
    origin: options.corsOrigin ?? true,
    credentials: true,
  });

  const auth = options.auth ?? readAuthConfig();
  await registerAuth(app, auth);

  const store = options.store ?? new InMemorySimulationStore();

  const ai = options.ai ?? readAiConfig();

  app.get('/health', async () => ({
    status: 'ok',
    engine: '0.1.0',
    authEnabled: auth.enabled,
    explainEnabled: (process.env.EXPLAIN_ENABLED ?? 'true').toLowerCase() !== 'false',
    aiEnabled: ai.enabled,
    aiModel: ai.enabled ? ai.model : undefined,
    timestamp: new Date().toISOString(),
  }));

  await app.register(
    async (scoped) => {
      await simulationsRoute(scoped, { store });
    },
    { prefix: '/api/v1/simulations' },
  );

  await app.register(
    async (scoped) => {
      await exportRoute(scoped, { store });
    },
    { prefix: '/api/v1/export' },
  );

  const users = options.users ?? new InMemoryUserStore();
  await app.register(
    async (scoped) => {
      await authRoute(scoped, { users });
    },
    { prefix: '/api/v1/auth' },
  );

  await app.register(
    async (scoped) => {
      await aiRoute(scoped, { config: ai, chat: options.chatFn });
    },
    { prefix: '/api/v1/ai' },
  );

  return app;
}

export async function resolveStore(): Promise<SimulationStore> {
  const backend = (process.env.STORE_BACKEND ?? 'memory').toLowerCase();
  if (backend === 'prisma') {
    const { createPrismaStore } = await import('./stores/prisma-store.js');
    return createPrismaStore();
  }
  return new InMemorySimulationStore();
}
