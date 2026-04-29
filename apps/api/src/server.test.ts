import { beforeEach, describe, expect, it } from 'vitest';
import { buildServer } from './server.js';
import { InMemorySimulationStore } from './store.js';

const validBody = {
  context: { sector: 'automotive', process: 'assembly' },
  inputs: {
    taskComplexity: 4,
    variability: 5,
    operatorExperience: 2,
    safetyRequired: 4,
    ergonomicLoad: 3,
    resourcesAvailable: 3,
    productivityGoal: 4,
    costConstraint: 3,
    leadershipPreference: 2,
    transparencyNeed: 4,
  },
};

describe('API /health', () => {
  it('returns ok', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok' });
    await app.close();
  });
});

describe('API /api/v1/simulations', () => {
  let app: Awaited<ReturnType<typeof buildServer>>;
  beforeEach(async () => {
    app = await buildServer({ logLevel: 'silent', store: new InMemorySimulationStore() });
  });

  it('creates a simulation (201)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: validBody,
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeTypeOf('string');
    expect(body.result.recommended).toBeTypeOf('string');
    expect(body.result.ranking).toHaveLength(6);
    await app.close();
  });

  it('rejects invalid payloads (400)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: { inputs: { taskComplexity: 9 } },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });

  it('lists and retrieves the saved simulation', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: validBody,
    });
    const id = create.json().id;

    const list = await app.inject({ method: 'GET', url: '/api/v1/simulations' });
    expect(list.statusCode).toBe(200);
    expect(list.json().items).toHaveLength(1);

    const one = await app.inject({ method: 'GET', url: `/api/v1/simulations/${id}` });
    expect(one.statusCode).toBe(200);
    expect(one.json().id).toBe(id);

    const missing = await app.inject({
      method: 'GET',
      url: '/api/v1/simulations/non-existent',
    });
    expect(missing.statusCode).toBe(404);
    await app.close();
  });

  it('honors the chosen strategy', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: { ...validBody, strategy: 'ahp' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().result.strategy).toBe('ahp-v1');
    await app.close();
  });
});

describe('API /api/v1/export/csv', () => {
  it('returns a CSV after saving a simulation', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    await app.inject({ method: 'POST', url: '/api/v1/simulations', payload: validBody });
    const res = await app.inject({ method: 'GET', url: '/api/v1/export/csv' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.body.split('\n')).toHaveLength(2); // header + 1 row
    expect(res.body.split('\n')[0]).toContain('recommended');
    await app.close();
  });
});

describe('API /api/v1/simulations — trace opt-in', () => {
  it('omits trace by default', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: validBody,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().result.trace).toBeUndefined();
    await app.close();
  });

  it('returns trace when payload sets trace=true', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: { ...validBody, trace: true },
    });
    const body = res.json();
    expect(body.result.trace).toBeDefined();
    expect(body.result.trace.kind).toBe('linear');
    expect(body.result.trace.rulesApplied).toBeTypeOf('object');
    await app.close();
  });

  it('returns trace for AHP and TOPSIS strategies', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    for (const strategy of ['ahp', 'topsis'] as const) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/simulations',
        payload: { ...validBody, strategy, trace: true },
      });
      const body = res.json();
      expect(body.result.trace.kind).toBe(strategy);
    }
    await app.close();
  });
});

describe('API /health', () => {
  it('exposes the explainEnabled flag', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({ method: 'GET', url: '/health' });
    const body = res.json();
    expect(body).toHaveProperty('explainEnabled');
    await app.close();
  });
});

describe('API /api/v1/simulations — TOPSIS', () => {
  it('accepts topsis strategy', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: { ...validBody, strategy: 'topsis' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().result.strategy).toBe('topsis-v1');
    await app.close();
  });

  it('rejects unknown strategy', async () => {
    const app = await buildServer({ logLevel: 'silent' });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/simulations',
      payload: { ...validBody, strategy: 'quantum' },
    });
    expect(res.statusCode).toBe(400);
    await app.close();
  });
});

describe('API /api/v1/auth', () => {
  it('registers and logs in a user', async () => {
    const app = await buildServer({ logLevel: 'silent' });

    const reg = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'op@example.com', password: 'password123', role: 'OPERATOR' },
    });
    expect(reg.statusCode).toBe(201);
    expect(reg.json().role).toBe('OPERATOR');

    const dup = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'op@example.com', password: 'password123' },
    });
    expect(dup.statusCode).toBe(409);

    const ok = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'op@example.com', password: 'password123' },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().user.email).toBe('op@example.com');

    const bad = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'op@example.com', password: 'wrong-pass' },
    });
    expect(bad.statusCode).toBe(401);

    const short = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'op@example.com', password: 'x' },
    });
    expect(short.statusCode).toBe(400);

    await app.close();
  });
});
