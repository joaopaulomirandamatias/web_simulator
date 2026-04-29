import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export interface AuthConfig {
  enabled: boolean;
  jwtSecret: string;
  expiresIn: string;
}

export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  return {
    enabled: env.AUTH_ENABLED === 'true',
    jwtSecret: env.JWT_SECRET ?? 'change-me-in-production-at-least-32-chars',
    expiresIn: env.JWT_EXPIRES_IN ?? '12h',
  };
}

/**
 * Registra o plugin de JWT quando `AUTH_ENABLED=true`.
 * Quando desligado (default no MVP), todas as rotas permanecem públicas.
 *
 * Em produção:
 *   AUTH_ENABLED=true JWT_SECRET=... pnpm start
 */
export async function registerAuth(app: FastifyInstance, config: AuthConfig) {
  if (!config.enabled) return;
  const jwtMod = await import('@fastify/jwt').catch(() => {
    app.log.warn('@fastify/jwt não instalado — rodando sem autenticação.');
    return null;
  });
  if (!jwtMod) return;
  await app.register(jwtMod.default, {
    secret: config.jwtSecret,
    sign: { expiresIn: config.expiresIn },
  });
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await (request as unknown as { jwtVerify: () => Promise<void> }).jwtVerify();
    } catch {
      return reply.unauthorized();
    }
  });
}
