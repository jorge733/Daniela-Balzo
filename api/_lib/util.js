/* Utilidades comunes de las funciones. */

export const json = (datos, status = 200) => Response.json(datos, { status, headers: { 'Cache-Control': 'no-store' } });
export const error = (mensaje, status = 400) => json({ error: mensaje }, status);

export async function cuerpo(request) {
  try { return await request.json(); } catch (e) { return {}; }
}

/** URL pública del sitio, sin "/" final. */
export function sitio(request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const u = new URL(request.url);
  return u.origin;
}
