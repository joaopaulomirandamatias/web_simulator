/**
 * Carrega o `.env` na raiz do monorepo. O Node não lê esse arquivo sozinho;
 * sem isso, AI_ENABLED, OPENROUTER_*, etc. nunca entram no processo da API.
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(here, '../../../.env');
config({ path: rootEnv, override: false });
