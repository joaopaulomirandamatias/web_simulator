/**
 * Carrega o .env da raiz do monorepo e testa a chave OpenRouter + um pedido mínimo.
 * Não imprime a chave completa (apenas sufixo).
 *
 * Uso: pnpm --filter @ahcf-cps/api verify:openrouter
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(new URL(import.meta.url))),
  '../../..',
);
config({ path: path.join(repoRoot, '.env'), override: false });

function maskKey(k: string): string {
  if (k.length <= 12) return '(definida, curta demais para mascarar)';
  return `${k.slice(0, 10)}…${k.slice(-4)} (len=${k.length})`;
}

const key = (process.env.OPENROUTER_API_KEY ?? '').trim();
const model = (process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini').trim();
const referer = process.env.OPENROUTER_REFERER ?? 'https://ahcf-cps.local';
const title = process.env.OPENROUTER_TITLE ?? 'verify-script';

if (!key) {
  console.error('OPENROUTER_API_KEY ausente ou vazio no .env (raiz do repositório).');
  process.exit(1);
}

const authHeaders: HeadersInit = {
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
};

console.log('Chave:', maskKey(key));
console.log('OPENROUTER_MODEL:', model);
console.log('---');

// 1) Ligeiro: informação da chave (quotas, sem completar)
const rKey = await fetch('https://openrouter.ai/api/v1/key', {
  headers: { Authorization: `Bearer ${key}` },
});
console.log('GET https://openrouter.ai/api/v1/key →', rKey.status, rKey.statusText);
if (rKey.ok) {
  const j = (await rKey.json()) as { data?: Record<string, unknown> };
  const d = j.data;
  if (d) {
    const safe: Record<string, unknown> = {};
    for (const k of [
      'label',
      'limit',
      'limit_reset',
      'is_free_tier',
      'usage',
      'usage_daily',
      'soft_limit',
    ]) {
      if (d[k] !== undefined) {
        safe[k] = d[k];
      }
    }
    console.log('Resumo (data):', JSON.stringify(safe, null, 0));
  } else {
    const raw = (await rKey.clone().text()).slice(0, 500);
    console.log('Body (corte):', raw);
  }
} else {
  console.log('Body:', (await rKey.text()).slice(0, 500));
}

console.log('---');

// 2) Uma conclusão mínima (testa cadeia até o fornecedor)
const rChat = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    ...authHeaders,
    'HTTP-Referer': referer,
    'X-OpenRouter-Title': title,
  } as Record<string, string>,
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: 'Responda apenas: OK' }],
    max_tokens: 16,
    temperature: 0,
  }),
});

const chatText = await rChat.text();
console.log('POST /chat/completions →', rChat.status, rChat.statusText);
if (rChat.status === 429) {
  console.log(
    '429 no chat: limite do fornecedor ou fila do modelo :free (a chave em si costuma estar OK se /key=200).',
  );
}
try {
  const parsed = JSON.parse(chatText) as {
    error?: { message?: string; code?: number; metadata?: { raw?: string; provider_name?: string } };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (parsed.error) {
    console.log('Detalhe:', JSON.stringify(parsed.error, null, 0));
    if (parsed.error.metadata?.raw) {
      console.log('Nota fornecedor:', String(parsed.error.metadata.raw).slice(0, 400));
    }
  } else if (parsed.choices?.[0]?.message?.content) {
    console.log('Resposta:', JSON.stringify(parsed.choices[0].message.content).slice(0, 200));
  } else {
    console.log('Body (corte):', chatText.slice(0, 800));
  }
} catch {
  console.log('Body (corte, não-JSON):', chatText.slice(0, 800));
}

if (!rKey.ok) {
  process.exit(1);
}
console.log('---');
if (rChat.ok) {
  console.log('Resultado: chave OK; completar (chat) OK.');
  process.exit(0);
}
if (rChat.status === 429) {
  console.log('Resultado: chave OK; completar devolveu 429 (tente outro OPENROUTER_MODEL ou espere o reset do :free).');
  process.exit(0);
}
console.log('Resultado: chave OK, mas o pedido de chat falhou (ver acima).');
process.exit(1);
