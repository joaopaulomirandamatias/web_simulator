import { PROGRAMMING_METHODS, SECTOR_IDS } from '@ahcf-cps/engine';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  chatCompletion,
  extractJson,
  OpenRouterError,
  type AiConfig,
  type ChatMessage,
} from '../ai/openrouter.js';
import { SimulationContextSchema, SimulationInputSchema } from '../schemas.js';

/**
 * Endpoints de IA assistiva (OpenRouter).
 *
 * Ativados somente quando `AI_ENABLED=true` e `OPENROUTER_API_KEY` está
 * presente. Caso contrário, retornam 503 e o frontend esconde os botões.
 *
 * Três capacidades:
 *   1. POST /explain           — gera explicação em linguagem natural do resultado.
 *   2. POST /suggest-strategy  — recomenda entre linear/ahp/topsis para o contexto.
 *   3. POST /generate-simulation — cria simulações sintéticas para validar o sistema.
 */

export interface AiDependencies {
  config: AiConfig;
  /** Injetável para testes (substitui a chamada real ao OpenRouter). */
  chat?: typeof chatCompletion;
}

const LocaleSchema = z.enum(['pt-BR', 'en']).optional();

const ExplainBody = z.object({
  inputs: SimulationInputSchema,
  context: SimulationContextSchema.optional(),
  result: z.object({
    recommended: z.string(),
    strategy: z.string(),
    ranking: z.array(
      z.object({
        method: z.string(),
        score: z.number(),
        normalized: z.number(),
      }),
    ),
    dimensions: z.object({
      safety: z.number(),
      ergonomic: z.number(),
      humanPreference: z.number(),
      performance: z.number(),
      taskComplexity: z.number(),
    }),
  }),
  locale: LocaleSchema,
});

const SuggestBody = z.object({
  context: SimulationContextSchema.optional(),
  notes: z.string().max(800).optional(),
  locale: LocaleSchema,
});

const GenerateBody = z.object({
  count: z.number().int().min(1).max(10).default(3),
  scenario: z.string().max(400).optional(),
  locale: LocaleSchema,
});

function languageName(locale: 'pt-BR' | 'en'): string {
  return locale === 'pt-BR' ? 'português do Brasil' : 'English';
}

/** Transmite o status HTTP vindo da OpenRouter; evita mapear 4xx/404 para 502. */
function httpStatusForOpenRouter(err: OpenRouterError): number {
  if (err.status >= 400 && err.status < 600) {
    return err.status;
  }
  return 502;
}

function renderInputs(
  inputs: z.infer<typeof SimulationInputSchema>,
  context: z.infer<typeof SimulationContextSchema> | undefined,
): string {
  const ctxParts = context
    ? Object.entries(context).filter(([, v]) => v !== undefined && v !== '')
    : [];
  const ctxLine = ctxParts.length
    ? `Contexto: ${ctxParts.map(([k, v]) => `${k}=${v}`).join(', ')}.`
    : 'Contexto: não informado.';
  const likerts = Object.entries(inputs)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  return `${ctxLine}\nInputs Likert (1–5): ${likerts}.`;
}

export const aiRoute: FastifyPluginAsync<AiDependencies> = async (app, deps) => {
  const chat = deps.chat ?? chatCompletion;
  const { config } = deps;

  app.addHook('onRequest', async (_request, reply) => {
    if (!config.enabled) {
      return reply.code(503).send({ error: 'AI_DISABLED' });
    }
  });

  app.get('/config', async () => ({
    enabled: config.enabled,
    model: config.model,
  }));

  /* ------------------------------------------------------------------ */
  /* /explain                                                           */
  /* ------------------------------------------------------------------ */
  app.post('/explain', async (request, reply) => {
    const parsed = ExplainBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    const { inputs, context, result, locale = 'pt-BR' } = parsed.data;
    const system: ChatMessage = {
      role: 'system',
      content:
        `Você é um assistente especializado em Human-Robot Collaboration industrial, ` +
        `ajudando a explicar recomendações do framework AHCF-CPS. ` +
        `Responda em ${languageName(locale)}, em no máximo 150 palavras, ` +
        `com foco em segurança, ergonomia, performance, complexidade da tarefa e ` +
        `preferências humanas. Não invente referências bibliográficas.`,
    };
    const dim = result.dimensions;
    const top3 = result.ranking.slice(0, 3);
    const user: ChatMessage = {
      role: 'user',
      content:
        `${renderInputs(inputs, context)}\n` +
        `Estratégia aplicada: ${result.strategy}.\n` +
        `Scores por dimensão (0..1): safety=${dim.safety.toFixed(2)}, ` +
        `ergonomic=${dim.ergonomic.toFixed(2)}, ` +
        `humanPreference=${dim.humanPreference.toFixed(2)}, ` +
        `performance=${dim.performance.toFixed(2)}, ` +
        `taskComplexity=${dim.taskComplexity.toFixed(2)}.\n` +
        `Método recomendado: ${result.recommended}.\n` +
        `Top 3: ${top3.map((r) => `${r.method}(${(r.normalized * 100).toFixed(0)}%)`).join(', ')}.\n` +
        `Explique em linguagem natural por que esse método é o mais adequado para o cenário.`,
    };

    try {
      const completion = await chat(config, [system, user], {
        temperature: 0.3,
        maxTokens: 350,
      });
      return reply.send({
        explanation: completion.content,
        model: completion.model,
        usage: completion.usage,
      });
    } catch (err) {
      if (err instanceof OpenRouterError) {
        return reply.code(httpStatusForOpenRouter(err)).send({ error: err.message });
      }
      throw err;
    }
  });

  /* ------------------------------------------------------------------ */
  /* /suggest-strategy                                                  */
  /* ------------------------------------------------------------------ */
  app.post('/suggest-strategy', async (request, reply) => {
    const parsed = SuggestBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    const { context, notes, locale = 'pt-BR' } = parsed.data;

    const system: ChatMessage = {
      role: 'system',
      content:
        `Você é um assistente que recomenda uma estratégia multicritério do framework ` +
        `AHCF-CPS entre três opções: "linear" (ponderada com regras), "ahp" ` +
        `(Analytic Hierarchy Process) ou "topsis". ` +
        `Responda SEMPRE em JSON estrito no formato: ` +
        `{"suggested":"linear|ahp|topsis","rationale":"<até 80 palavras em ${languageName(locale)}>"}. ` +
        `Considere: linear é simples e rápida; ahp é boa quando há hierarquia clara de critérios; ` +
        `topsis é boa quando se quer comparar cada método com soluções ideais. ` +
        `Nunca retorne nada além do JSON.`,
    };
    const ctxParts = context
      ? Object.entries(context).filter(([, v]) => v !== undefined && v !== '')
      : [];
    const ctxLine = ctxParts.length
      ? ctxParts.map(([k, v]) => `${k}=${v}`).join(', ')
      : 'não informado';
    const user: ChatMessage = {
      role: 'user',
      content:
        `Contexto: ${ctxLine}.\n` +
        (notes ? `Notas do usuário: ${notes}\n` : '') +
        `Qual estratégia você recomenda?`,
    };

    try {
      // Não usar response_format: json — muitos modelos :free quebram; o prompt força JSON e
      // extractJson tolera markdown/ruído.
      const completion = await chat(config, [system, user], {
        temperature: 0.2,
        maxTokens: 250,
        jsonMode: false,
      });
      const obj = extractJson<{ suggested: string; rationale: string }>(
        completion.content,
      );
      const suggested = (obj.suggested ?? '').toLowerCase();
      if (!['linear', 'ahp', 'topsis'].includes(suggested)) {
        return reply.code(422).send({ error: 'invalid strategy from model' });
      }
      return reply.send({
        suggested,
        rationale: String(obj.rationale ?? ''),
        model: completion.model,
      });
    } catch (err) {
      if (err instanceof OpenRouterError) {
        return reply.code(httpStatusForOpenRouter(err)).send({ error: err.message });
      }
      return reply.code(422).send({ error: (err as Error).message });
    }
  });

  /* ------------------------------------------------------------------ */
  /* /generate-simulation                                               */
  /* ------------------------------------------------------------------ */
  app.post('/generate-simulation', async (request, reply) => {
    const parsed = GenerateBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.issues.map((i) => i.message).join('; '));
    }
    const { count, scenario, locale = 'pt-BR' } = parsed.data;

    const system: ChatMessage =
      locale === 'en'
        ? {
            role: 'system',
            content:
              `You output synthetic but REALISTIC human–robot collaboration (HRC) / industrial cobot scenarios to validate the AHCF-CPS decision framework in test mode. ` +
              `Base each case on believable shop-floor situations (e.g. automotive assembly, logistics, metalworking, food, electronics): name a plausible process, typical constraints, and coherent Likert values. ` +
              `Vary sectors across examples when it fits. ` +
              `Each simulation must include: "context" with "sector" ∈ [${SECTOR_IDS.join(', ')}] and optional "process" / "taskType", ` +
              `and "inputs" with ALL 10 Likert 1..5: taskComplexity, variability, operatorExperience, ` +
              `safetyRequired, ergonomicLoad, resourcesAvailable, productivityGoal, costConstraint, ` +
              `leadershipPreference, transparencyNeed. ` +
              `Keep "label" as a short realistic title in English (for a test log only). ` +
              `Response MUST be strict JSON: {"simulations":[{"label":"…","context":{...},"inputs":{...}}, ...]}. ` +
              `Programming methods in the system are ${PROGRAMMING_METHODS.join(', ')} — you do NOT choose the method, only the inputs. JSON only, no other text.`,
          }
        : {
            role: 'system',
            content:
              `Você gera simulações sintéticas, porém com BASE REALISTA, de HRC (Human-Robot Collaboration) / cobots industriais para validar o framework AHCF-CPS no modo de teste. ` +
              `Cada caso deve lembrar situações reais de chão de fábrica (ex.: montagem automotiva, logística, metal-mecânica, alimentos, eletrônica): proposta de processo plausível, amarrar os Likerts de forma coerente com a narrativa. ` +
              `Varie setores entre os exemplos quando fizer sentido. ` +
              `Cada simulação: "context" com "sector" ∈ [${SECTOR_IDS.join(', ')}] e opcionais (process, taskType, etc.) ` +
              `e "inputs" com TODOS os 10 Likert 1..5: taskComplexity, variability, operatorExperience, ` +
              `safetyRequired, ergonomicLoad, resourcesAvailable, productivityGoal, costConstraint, ` +
              `leadershipPreference, transparencyNeed. ` +
              `O "label" é um título curto em português do Brasil, apenas para anotação no registro de testes. ` +
              `Responda SEMPRE em JSON estrito: {"simulations":[{"label":"…","context":{...},"inputs":{...}}, ...]}. ` +
              `Métodos possíveis: ${PROGRAMMING_METHODS.join(', ')} — você NÃO decide o método, só o input. Nada além do JSON.`,
          };
    const user: ChatMessage = {
      role: 'user',
      content:
        (locale === 'en'
          ? `Generate ${count} realistic scenario(s) for batch testing`
          : `Gere ${count} simulaç${count > 1 ? 'ões' : 'ão'} realista${count > 1 ? 's' : ''} em lote para o teste`) +
        (scenario
          ? locale === 'en'
            ? ` aligned to: ${scenario}.`
            : ` alinhada${count > 1 ? 's' : ''} a: ${scenario}.`
          : '.'),
    };

    try {
      const completion = await chat(config, [system, user], {
        temperature: 0.6,
        maxTokens: 1200,
        jsonMode: false,
      });
      const obj = extractJson<{ simulations?: Array<unknown> }>(completion.content);
      const rawList = Array.isArray(obj.simulations) ? obj.simulations : [];
      const simulations: Array<{ label?: string; inputs: unknown; context?: unknown }> = [];
      for (const item of rawList) {
        const parsedSim = z
          .object({
            label: z.string().optional(),
            context: SimulationContextSchema.optional(),
            inputs: SimulationInputSchema,
          })
          .safeParse(item);
        if (parsedSim.success) simulations.push(parsedSim.data);
      }
      if (simulations.length === 0) {
        return reply.code(502).send({ error: 'no valid simulations from model' });
      }
      return reply.send({
        simulations,
        model: completion.model,
        requested: count,
        returned: simulations.length,
      });
    } catch (err) {
      if (err instanceof OpenRouterError) {
        return reply.code(httpStatusForOpenRouter(err)).send({ error: err.message });
      }
      return reply.code(422).send({ error: (err as Error).message });
    }
  });
};
