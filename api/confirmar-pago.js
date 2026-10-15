/* POST /api/confirmar-pago { pago, inscripcion? } -> { estado }
   Al volver de Mercado Pago se revisa el pago por si la notificación aún no llega.
   Curso online: con sesión iniciada. Clase presencial: con el número de inscripción. */
import { usuarioDe } from './_lib/firebase.js';
import { obtenerPago, registrarPago } from './_lib/mercadopago.js';
import { json, error, cuerpo } from './_lib/util.js';

export async function POST(request) {
  const { pago: id, inscripcion } = await cuerpo(request);
  if (!/^[\w-]{1,40}$/.test(String(id || ''))) return error('Pago inválido.');
  if (inscripcion !== undefined && !/^[\w-]{1,40}$/.test(String(inscripcion))) return error('Inscripción inválida.');
  const usuario = inscripcion ? null : await usuarioDe(request);
  if (!inscripcion && !usuario) return error('Inicia sesión.', 401);

  try {
    const pago = await obtenerPago(id);
    // Solo se confirma el pago propio: el de la cuenta, o el de esta inscripción.
    const dueno = inscripcion ? `insc|${inscripcion}|` : usuario.uid + '|';
    if (!String(pago.external_reference || '').startsWith(dueno)) return error('Este pago no es tuyo.', 403);
    return json(await registrarPago(pago));
  } catch (e) {
    console.error('confirmar-pago', e);
    return error('No pudimos revisar el pago.', 502);
  }
}
