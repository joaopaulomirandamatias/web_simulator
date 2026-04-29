import bcrypt from 'bcryptjs';
import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/**
 * Endpoints de autenticação simplificados para o MVP.
 *
 * - Quando `AUTH_ENABLED=true` e `@fastify/jwt` está registrado
 *   (ver `auth.ts`), `POST /login` emite um token.
 * - O store de usuários aqui é in-memory e opcional; em produção, troque
 *   por consulta via Prisma (tabela `User`).
 */

export const CredentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(['OPERATOR', 'MANAGER', 'ADMIN']).optional(),
});

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'OPERATOR' | 'MANAGER' | 'ADMIN';
}

export class InMemoryUserStore {
  private readonly byEmail = new Map<string, UserRecord>();

  async register(email: string, password: string, role: UserRecord['role']): Promise<UserRecord> {
    if (this.byEmail.has(email)) throw new Error('EMAIL_TAKEN');
    const user: UserRecord = {
      id: randomUUID(),
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
    };
    this.byEmail.set(email, user);
    return user;
  }

  async verify(email: string, password: string): Promise<UserRecord | undefined> {
    const user = this.byEmail.get(email);
    if (!user) return undefined;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : undefined;
  }
}

export const authRoute: FastifyPluginAsync<{ users: InMemoryUserStore }> = async (
  app,
  { users },
) => {
  app.post('/register', async (request, reply) => {
    const parsed = CredentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    try {
      const user = await users.register(
        parsed.data.email,
        parsed.data.password,
        parsed.data.role ?? 'OPERATOR',
      );
      return reply.code(201).send({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      if ((err as Error).message === 'EMAIL_TAKEN') {
        return reply.conflict('email already registered');
      }
      throw err;
    }
  });

  app.post('/login', async (request, reply) => {
    const parsed = CredentialsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    const user = await users.verify(parsed.data.email, parsed.data.password);
    if (!user) return reply.unauthorized('invalid credentials');

    const hasJwt = typeof (app as unknown as { jwt?: unknown }).jwt !== 'undefined';
    const token = hasJwt
      ? (app as unknown as { jwt: { sign: (p: unknown) => string } }).jwt.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
        })
      : null;

    return reply.send({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  });
};
