/**
 * Exemplo oficial ajustado: stream com @openrouter/sdk e modelo openrouter/free.
 * Lê `OPENROUTER_API_KEY` (e opcionalmente REFERER/TITLE) do .env na raiz do monorepo.
 *
 *   pnpm --filter @ahcf-cps/api openrouter:stream-example
 */
import { OpenRouter } from '@openrouter/sdk';
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(new URL(import.meta.url))),
  '../../..',
);
config({ path: path.join(repoRoot, '.env'), override: false });

const apiKey = (process.env.OPENROUTER_API_KEY ?? '').trim();
if (!apiKey) {
  console.error('Defina OPENROUTER_API_KEY no .env (raiz do repositório).');
  process.exit(1);
}

const openrouter = new OpenRouter({
  apiKey,
  httpReferer: process.env.OPENROUTER_REFERER ?? 'https://ahcf-cps.local',
  appTitle: process.env.OPENROUTER_TITLE ?? 'openrouter-stream-example',
  timeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 120_000),
});

const model = process.env.OPENROUTER_STREAM_MODEL ?? 'openrouter/free';
const userPrompt = process.env.OPENROUTER_STREAM_PROMPT ?? "How many r's are in the word 'strawberry'?";

// O SDK exige `chatRequest` (não passar model/messages no nível raiz).
const stream = await openrouter.chat.send({
  httpReferer: process.env.OPENROUTER_REFERER ?? 'https://ahcf-cps.local',
  appTitle: process.env.OPENROUTER_TITLE ?? 'openrouter-stream-example',
  chatRequest: {
    model,
    messages: [{ role: 'user', content: userPrompt }],
    stream: true,
  },
});

let response = '';
let lastModel = model;
for await (const chunk of stream) {
  if (chunk.error) {
    console.error('\nErro no stream:', chunk.error);
    break;
  }
  if (chunk.model) {
    lastModel = chunk.model;
  }
  const content = chunk.choices?.[0]?.delta?.content;
  if (content) {
    response += content;
    process.stdout.write(String(content));
  }
  if (chunk.usage) {
    const u = chunk.usage;
    const reasoning = u.completionTokensDetails?.reasoningTokens;
    console.log(
      '\n[usage] prompt=%s completion=%s total=%s reasoning=%s',
      u.promptTokens,
      u.completionTokens,
      u.totalTokens,
      reasoning ?? 'n/d',
    );
  }
}
console.log('\n---\nModelo (resposta):', lastModel);
console.log('Caracteres acumulados:', response.length);
