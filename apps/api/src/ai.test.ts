import { describe, expect, it, vi } from 'vitest';
import type { AiConfig, ChatCompletionResult } from './ai/openrouter.js';
import { extractJson } from './ai/openrouter.js';
import { buildServer } from './server.js';

const enabledConfig: AiConfig = {
  enabled: true,
  apiKey: 'test-key',
  model: 'mocked/model',
  referer: 'https://test',
  title: 'test',
  timeoutMs: 5000,
  maxRetries: 0,
  retryBaseMs: 2000,
};

function mockChat(text: string) {
  return vi.fn<
    (..._args: unknown[]) => Promise<ChatCompletionResult>
  >(async () => ({ content: text, model: enabledConfig.model }));
}

const validInputs = {
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
};

const dummyResult = {
  recommended: 'shared_control',
  strategy: 'linear-v1',
  ranking: [
    { method: 'shared_control', score: 1.2, normalized: 1 },
    { method: 'pbd', score: 0.9, normalized: 0.6 },
    { method: 'parameterized', score: 0.7, normalized: 0.3 },
  ],
  dimensions: {
    safety: 0.75,
    ergonomic: 0.5,
    humanPreference: 0.7,
    performance: 0.75,
    taskComplexity: 0.85,
  },
};

describe('AI endpoints — disabled', () => {
  it('returns 503 when AI_ENABLED is false', async () => {
    const app = await buildServer({ logLevel: 'silent' }); // default: disabled
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/explain',
      payload: { inputs: validInputs, result: dummyResult },
    });
    expect(res.statusCode).toBe(503);
    const body = await app.inject({ method: 'GET', url: '/health' });
    expect(body.json().aiEnabled).toBe(false);
    await app.close();
  });
});

describe('AI endpoints — enabled (mocked OpenRouter)', () => {
  it('/explain returns natural language explanation', async () => {
    const chatFn = mockChat('Este método prioriza segurança e ergonomia porque…');
    const app = await buildServer({
      logLevel: 'silent',
      ai: enabledConfig,
      chatFn,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/explain',
      payload: { inputs: validInputs, result: dummyResult, locale: 'pt-BR' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.explanation).toContain('segurança');
    expect(body.model).toBe('mocked/model');
    expect(chatFn).toHaveBeenCalledTimes(1);
    await app.close();
  });

  it('/suggest-strategy returns one of {linear, ahp, topsis}', async () => {
    const chatFn = mockChat('{"suggested":"ahp","rationale":"Hierarquia clara."}');
    const app = await buildServer({
      logLevel: 'silent',
      ai: enabledConfig,
      chatFn,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/suggest-strategy',
      payload: { context: { sector: 'automotive' }, locale: 'pt-BR' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().suggested).toBe('ahp');
    await app.close();
  });

  it('/suggest-strategy rejects unknown strategies from the model', async () => {
    const chatFn = mockChat('{"suggested":"quantum","rationale":"—"}');
    const app = await buildServer({
      logLevel: 'silent',
      ai: enabledConfig,
      chatFn,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/suggest-strategy',
      payload: { locale: 'pt-BR' },
    });
    expect(res.statusCode).toBe(422);
    await app.close();
  });

  it('/generate-simulation returns validated inputs', async () => {
    const payload = {
      simulations: [
        {
          label: 'Alta variabilidade',
          context: { sector: 'logistics' },
          inputs: validInputs,
        },
        {
          label: 'Inválido (descartado)',
          inputs: { ...validInputs, taskComplexity: 9 }, // fora do range 1..5
        },
      ],
    };
    const chatFn = mockChat(JSON.stringify(payload));
    const app = await buildServer({
      logLevel: 'silent',
      ai: enabledConfig,
      chatFn,
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/generate-simulation',
      payload: { count: 2, scenario: 'warehouse AGV' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.simulations).toHaveLength(1); // o inválido é filtrado
    expect(body.requested).toBe(2);
    expect(body.returned).toBe(1);
    await app.close();
  });

  it('/config echoes model and enabled', async () => {
    const app = await buildServer({ logLevel: 'silent', ai: enabledConfig });
    const res = await app.inject({ method: 'GET', url: '/api/v1/ai/config' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ enabled: true, model: 'mocked/model' });
    await app.close();
  });
});

describe('extractJson helper', () => {
  it('parses plain JSON', () => {
    expect(extractJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });
  it('parses fenced JSON', () => {
    expect(extractJson<{ a: number }>('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it('parses JSON embedded in prose', () => {
    expect(extractJson<{ a: number }>('Resultado: {"a":3}. Pronto.')).toEqual({ a: 3 });
  });
});
