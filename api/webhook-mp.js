/* POST /api/webhook-mp
   Notificación de Mercado Pago. Nunca se confía en el cuerpo: el pago se consulta a la API. */
import { obtenerPago, registrarPago, firmaValida } from './_lib/mercadopago.js';
import { json, cuerpo } from './_lib/util.js';

export async function POST(request) {
  const url = new URL(request.url);
  const datos = await cuerpo(request);
  const tipo = datos.type || url.searchParams.get('type') || url.searchParams.get('topic');
  const id = url.searchParams.get('data.id') || datos.data?.id || url.searchParams.get('id');

  if (tipo !== 'payment' || !id) return json({ ok: true, ignorado: true });
  if (!firmaValida(request, id)) return json({ error: 'Firma inválida' }, 401);

  try {
    const r = await registrarPago(await obtenerPago(id));
    return json({ ok: true, ...r });
  } catch (e) {
    console.error('webhook-mp', id, e);
    // 500 hace que Mercado Pago reintente más tarde.
    return json({ error: 'No se pudo procesar' }, 500);
  }
}
