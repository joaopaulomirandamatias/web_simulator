/**
 * Testa uma lista de modelos OpenRouter (completions mínimas).
 * Uso: pnpm --filter @ahcf-cps/api test:openrouter-models
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(new URL(import.meta.url))),
  '../../..',
);
config({ path: path.join(repoRoot, '.env'), override: false });

const MODELS = [
  'openrouter/free',
  'qwen/qwen3-coder:free',
  'openai/gpt-oss-20b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'google/gemma-3-27b-it:free',
] as const;

const key = (process.env.OPENROUTER_API_KEY ?? '').trim();
const referer = process.env.OPENROUTER_REFERER ?? 'https://ahcf-cps.local';
const title = process.env.OPENROUTER_TITLE ?? 'model-probe';

if (!key) {
  console.error('OPENROUTER_API_KEY ausente no .env');
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function probe(model: string): Promise<{ ok: boolean; status: number; note: string }> {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-OpenRouter-Title': title,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 8,
      temperature: 0,
    }),
  });
  const text = await r.text();
  if (!r.ok) {
    let note = text.slice(0, 200);
    try {
      const j = JSON.parse(text) as { error?: { message?: string; metadata?: { raw?: string } } };
      if (j.error?.metadata?.raw) {
        note = j.error.metadata.raw.slice(0, 300);
      } else if (j.error?.message) {
        note = j.error.message;
      }
    } catch {
      /* use raw */
    }
    return { ok: false, status: r.status, note };
  }
  try {
    const j = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
    const c = j.choices?.[0]?.message?.content?.trim() ?? '';
    return { ok: c.length > 0, status: r.status, note: c ? `content: ${c.slice(0, 40)}` : 'empty content' };
  } catch {
    return { ok: false, status: r.status, note: 'parse fail' };
  }
}

console.log('A testar', MODELS.length, 'modelos (pausa 2,5s entre pedidos)…\n');

const results: Array<{ model: string; ok: boolean; status: number; note: string }> = [];

for (const model of MODELS) {
  const row = await probe(model);
  results.push({ model, ...row });
  const icon = row.ok && row.status === 200 ? 'OK' : '—';
  console.log(`${icon}  ${row.status}  ${model}`);
  if (!row.ok || row.status !== 200) {
    console.log(`     ${row.note}\n`);
  } else {
    console.log(`     ${row.note}\n`);
  }
  await sleep(2500);
}

const working = results.filter((r) => r.ok && r.status === 200);
console.log('---');
console.log('A responder agora (200 + conteúdo):', working.length, '/', MODELS.length);
for (const w of working) {
  console.log('  ·', w.model);
}
if (working.length === 0) {
  console.log('Nenhum respondeu com sucesso; pode ser rate limit global—tenta de novo em alguns minutos.');
}
