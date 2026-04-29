const RAW = import.meta.env.VITE_API_URL as string | undefined;

/**
 * Prefixo do backend sem barra final.
 * - `undefined`: variável ausente no build — modo demo (engine local / sem login HTTP).
 * - `''`: monólito (mesma origem); usar URLs relativas `/api/...`.
 * - URL absoluta: backend em outro host.
 */
export function getApiBase(): string {
  return RAW === undefined ? '' : String(RAW).replace(/\/$/, '');
}

/** Build configurado para usar o backend HTTP (monólito inclui `VITE_API_URL` vazio). */
export function isApiConfigured(): boolean {
  return RAW !== undefined;
}
