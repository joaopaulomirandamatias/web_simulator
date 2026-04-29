/**
 * OpenRouter: SDK em modo não-streaming. Lê `content` ou `reasoning`.
 * Retentativas com backoff em 429/529 (limite do fornecedor / fila :free).
 */

import { OpenRouter } from '@openrouter/sdk';

type SdkAssistantMessage = {
  content?: string | unknown[] | null;
  reasoning?: string | null;
  refusal?: string | null;
};
type SdkChatResult = {
  choices: Array<{ message?: SdkAssistantMessage }>;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};
type SdkRequestMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };

export interface AiConfig {
  enabled: boolean;
  apiKey: string;
  model: string;
  referer: string;
  title: string;
  /** Timeout por tentativa de completion (ms). */
  timeoutMs: number;
  /** Retentativas extra em 429/529 (além da 1.ª). */
  maxRetries: number;
  /** Base do backoff exponencial (ms), + jitter. */
  retryBaseMs: number;
}

function envInt(env: NodeJS.ProcessEnv, key: string, fallback: number, min: number, max: number): number {
  const n = Number(env[key] ?? fallback);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function readAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  return {
    enabled:
      (env.AI_ENABLED ?? 'false').toLowerCase() === 'true' &&
      (env.OPENROUTER_API_KEY ?? '').length > 0,
    apiKey: env.OPENROUTER_API_KEY ?? '',
    // `openrouter/free` = router que escolhe um modelo :free com menos 429 contínuo do que um id fixo saturado.
    model: env.OPENROUTER_MODEL ?? 'openrouter/free',
    referer: env.OPENROUTER_REFERER ?? 'https://ahcf-cps.example',
    title: env.OPENROUTER_TITLE ?? 'AHCF-CPS Web Simulator',
    timeoutMs: envInt(env, 'OPENROUTER_TIMEOUT_MS', 60_000, 5_000, 300_000),
    maxRetries: envInt(env, 'OPENROUTER_MAX_RETRIES', 4, 0, 12),
    retryBaseMs: envInt(env, 'OPENROUTER_RETRY_BASE_MS', 2_000, 200, 60_000),
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  /** Se true, pede JSON estrito (`response_format: json_object`). */
  jsonMode?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function toSdkMessages(messages: ChatMessage[]): SdkRequestMessage[] {
  return messages.map((m) => {
    if (m.role === 'system') {
      return { role: 'system' as const, content: m.content };
    }
    if (m.role === 'user') {
      return { role: 'user' as const, content: m.content };
    }
    return { role: 'assistant' as const, content: m.content };
  });
}

function extractAssistantText(message: SdkAssistantMessage | undefined): string {
  if (!message) return '';
  const c = message.content;
  if (typeof c === 'string' && c.trim()) {
    return c.trim();
  }
  if (Array.isArray(c)) {
    const joined = c
      .map((part) => {
        if (part && typeof part === 'object' && 'text' in (part as object)) {
          return String((part as { text: string }).text);
        }
        if (typeof part === 'string') {
          return part;
        }
        return '';
      })
      .join('')
      .trim();
    if (joined) return joined;
  }
  const r = message.reasoning;
  if (typeof r === 'string' && r.trim()) {
    return r.trim();
  }
  const refusal = message.refusal;
  if (typeof refusal === 'string' && refusal.trim()) {
    return refusal.trim();
  }
  return '';
}

function resultFromChatPayload(result: SdkChatResult, fallbackModel: string): ChatCompletionResult {
  const msg = result.choices[0]?.message;
  const content = extractAssistantText(msg);
  const u = result.usage;
  return {
    content,
    model: result.model ?? fallbackModel,
    usage: u
      ? {
          promptTokens: u.promptTokens,
          completionTokens: u.completionTokens,
          totalTokens: u.totalTokens,
        }
      : undefined,
  };
}

function mapSdkError(err: unknown): OpenRouterError {
  if (err instanceof OpenRouterError) {
    return err;
  }
  if (err !== null && typeof err === 'object' && 'statusCode' in err) {
    const e = err as { statusCode: number; message: string; body?: string };
    return new OpenRouterError(
      e.message || `OpenRouter HTTP ${e.statusCode}`,
      e.statusCode,
      e.body,
    );
  }
  return new OpenRouterError((err as Error).message ?? 'OpenRouter request failed', 502);
}

/**
 * Uma “rajada” de envio: pode tentar com json_object e cair para plain.
 */
async function sendOneAttempt(
  config: AiConfig,
  client: OpenRouter,
  messages: SdkRequestMessage[],
  options: ChatCompletionOptions,
  jsonMode: boolean,
  signal: AbortSignal,
): Promise<SdkChatResult> {
  const base = {
    httpReferer: config.referer,
    appTitle: config.title,
    chatRequest: {
      model: config.model,
      messages,
      stream: false as const,
      temperature: options.temperature ?? 0.3,
      maxTokens: options.maxTokens ?? 800,
    },
  };

  if (!jsonMode) {
    const out = await client.chat.send(base, { signal });
    return out as unknown as SdkChatResult;
  }

  try {
    const out = await client.chat.send(
      {
        ...base,
        chatRequest: {
          ...base.chatRequest,
          responseFormat: { type: 'json_object' as const },
        },
      },
      { signal },
    );
    return out as unknown as SdkChatResult;
  } catch (e) {
    const o = mapSdkError(e);
    if ([400, 422, 429, 500, 502, 503, 504, 529].includes(o.status)) {
      const out = await client.chat.send(base, { signal });
      return out as unknown as SdkChatResult;
    }
    throw o;
  }
}

async function sendWith429Retries(
  config: AiConfig,
  messages: ChatMessage[],
  options: ChatCompletionOptions,
  jsonMode: boolean,
): Promise<SdkChatResult> {
  const client = new OpenRouter({
    apiKey: config.apiKey,
    httpReferer: config.referer,
    appTitle: config.title,
    // timeout de rede por tentativa: SDK usa; uma tentativa = uma janela
    timeoutMs: config.timeoutMs,
  });
  const sdkMessages = toSdkMessages(messages);
  const maxTries = 1 + config.maxRetries;
  let last: OpenRouterError | undefined;

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const result = await sendOneAttempt(
        config,
        client,
        sdkMessages,
        options,
        jsonMode,
        controller.signal,
      );
      clearTimeout(timer);
      return result;
    } catch (e) {
      clearTimeout(timer);
      if ((e as Error).name === 'AbortError') {
        last = new OpenRouterError('OpenRouter timeout (tentativa)', 504);
      } else {
        last = mapSdkError(e);
      }
      const isRateLimited = last.status === 429 || last.status === 529;
      if (isRateLimited && attempt < maxTries - 1) {
        const cap = 45_000;
        const delay = Math.min(
          cap,
          config.retryBaseMs * Math.pow(1.6, attempt) + Math.random() * 500,
        );
        await sleep(delay);
        continue;
      }
      throw last;
    }
  }
  throw last ?? new OpenRouterError('OpenRouter: retentativas esgotadas', 429);
}

/**
 * Uma chat completion. Lança `OpenRouterError` se desativado ou resposta inútil.
 */
export async function chatCompletion(
  config: AiConfig,
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
): Promise<ChatCompletionResult> {
  if (!config.enabled) {
    throw new OpenRouterError('AI_DISABLED', 503);
  }
  const result = await sendWith429Retries(
    config,
    messages,
    options,
    Boolean(options.jsonMode),
  );
  const out = resultFromChatPayload(result, config.model);
  if (!out.content) {
    throw new OpenRouterError('Empty completion (no content or reasoning in response)', 502, result);
  }
  return out;
}

/** Tenta extrair o primeiro bloco JSON de uma string (modo defensivo). */
export function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    /* fallback abaixo */
  }
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]) as T;
  }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    return JSON.parse(trimmed.slice(first, last + 1)) as T;
  }
  throw new Error('Could not extract JSON from model output');
}
