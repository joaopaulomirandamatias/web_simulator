import './load-root-env.js';
import { buildServer, resolveStore } from './server.js';

async function main() {
  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? '0.0.0.0';
  const corsOrigin = process.env.CORS_ORIGIN ?? true;

  const store = await resolveStore();
  const app = await buildServer({
    corsOrigin: typeof corsOrigin === 'string' ? corsOrigin.split(',') : corsOrigin,
    store,
  });

  try {
    await app.listen({ port, host });
    app.log.info(`AHCF-CPS API listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
