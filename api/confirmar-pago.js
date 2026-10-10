/* POST /api/confirmar-pago { pago } -> { estado }
   Al volver de Mercado Pago, el aula revisa el pago por si la notificación aún no llega. */
import { usuarioDe } from './_lib/firebase.js';
import { obtenerPago, registrarPago } from './_lib/mercadopago.js';
import { json, error, cuerpo } from './_lib/util.js';

export async function POST(request) {
  const usuario = await usuarioDe(request);
  if (!usuario) return error('Inicia sesión.', 401);
  const { pago: id } = await cuerpo(request);
  if (!/^[\w-]{1,40}$/.test(String(id || ''))) return error('Pago inválido.');

  try {
    const pago = await obtenerPago(id);
    // Solo la dueña del pago puede confirmarlo desde aquí.
    if (!String(pago.external_reference || '').startsWith(usuario.uid + '|')) return error('Este pago no es tuyo.', 403);
    return json(await registrarPago(pago));
  } catch (e) {
    console.error('confirmar-pago', e);
    return error('No pudimos revisar el pago.', 502);
  }
}
