/* Mercado Pago (API REST) y registro de compras.
   Sin MP_ACCESS_TOKEN y con emuladores, los pagos se simulan (ver /api/simular-pago). */
import crypto from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { auth, db, EMULADOR } from './firebase.js';

const API = 'https://api.mercadopago.com';
export const SIMULADO = !process.env.MP_ACCESS_TOKEN && EMULADOR;

async function mp(ruta, opciones = {}) {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('Falta MP_ACCESS_TOKEN');
  const r = await fetch(API + ruta, {
    ...opciones,
    headers: { Authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json', ...opciones.headers }
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago respondió ${r.status}: ${datos.message || ''}`);
  return datos;
}

// La referencia viaja en el pago y vuelve en la confirmación:
//   curso online:      "uid|cursoId|precio"
//   clase presencial:  "insc|inscripcionId|precio"  (los datos de quien paga están en inscripciones/<id>)
export const referencia = (uid, cursoId, precio) => [uid, cursoId, precio].join('|');
export function leerReferencia(ref) {
  const [a, b, precio] = String(ref || '').split('|');
  if (!a || !b || !precio) return null;
  return a === 'insc' ? { inscripcion: b, precio: Number(precio) } : { uid: a, curso: b, precio: Number(precio) };
}

/** Crea la preferencia de pago y devuelve la URL del checkout (curso online o clase presencial). */
export async function crearPreferencia({ curso, usuario, clase, inscripcion, nombre, correo, base }) {
  const item = curso || clase;
  const ref = curso ? referencia(usuario.uid, curso.id, curso.precio) : ['insc', inscripcion, clase.precio].join('|');
  if (SIMULADO) {
    return `${base}/api/simular-pago?ref=${encodeURIComponent(ref)}`;
  }
  const volver = curso
    ? { ok: `${base}/aula?pago=ok&curso=${encodeURIComponent(curso.id)}`, error: `${base}/curso?id=${encodeURIComponent(curso.id)}&pago=error` }
    : { ok: `${base}/inscripcion?id=${encodeURIComponent(inscripcion)}`, error: `${base}/${clase.pagina || 'clase?id=' + encodeURIComponent(clase.id)}${clase.pagina ? '?' : '&'}pago=error` };
  const p = await mp('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      items: [{ id: item.id, title: item.titulo, quantity: 1, unit_price: item.precio, currency_id: 'CLP' }],
      payer: curso ? { email: usuario.email } : { name: nombre, email: correo },
      external_reference: ref,
      back_urls: { success: volver.ok, pending: volver.ok, failure: volver.error },
      auto_return: 'approved',
      notification_url: `${base}/api/webhook-mp`,
      statement_descriptor: 'NEGRA MORA'
    })
  });
  return p.init_point;
}

/** Datos del pago desde Mercado Pago (o desde la simulación local). */
export async function obtenerPago(id) {
  if (SIMULADO) {
    const d = await db.collection('_pagos_simulados').doc(String(id)).get();
    if (!d.exists) throw new Error('Pago simulado no encontrado');
    return d.data();
  }
  return mp('/v1/payments/' + encodeURIComponent(id));
}

/**
 * Revisa el pago y, si está aprobado, registra la venta: da acceso al curso online
 * o marca pagada la inscripción a la clase presencial.
 * Se puede llamar varias veces con el mismo pago: solo lo registra una vez.
 */
export async function registrarPago(pago) {
  if (pago.status !== 'approved') return { estado: pago.status };
  const ref = leerReferencia(pago.external_reference);
  if (!ref) throw new Error('Pago sin referencia válida: ' + pago.id);
  if (pago.currency_id !== 'CLP' || Number(pago.transaction_amount) < ref.precio) {
    throw new Error(`Monto o moneda no coinciden en el pago ${pago.id}`);
  }
  if (ref.inscripcion) return registrarInscripcion(pago, ref);

  const cursoDoc = await db.collection('cursos').doc(ref.curso).get();
  const usuario = await auth.getUser(ref.uid).catch(() => null);
  const ventaRef = db.collection('ventas').doc(String(pago.id));
  const accesoRef = db.collection('accesos').doc(ref.uid);

  await db.runTransaction(async (tx) => {
    if ((await tx.get(ventaRef)).exists) return;
    tx.set(ventaRef, {
      fecha: FieldValue.serverTimestamp(),
      uid: ref.uid,
      nombre: usuario?.displayName || '',
      correo: usuario?.email || pago.payer?.email || '',
      curso: ref.curso,
      titulo: cursoDoc.exists ? cursoDoc.data().titulo : ref.curso,
      monto: Number(pago.transaction_amount),
      neto: Number(pago.transaction_details?.net_received_amount ?? pago.transaction_amount),
      medio: pago.payment_method_id || ''
    });
    tx.set(accesoRef, { cursos: { [ref.curso]: true } }, { merge: true });
  });
  return { estado: 'approved', curso: ref.curso, uid: ref.uid };
}

async function registrarInscripcion(pago, ref) {
  const inscRef = db.collection('inscripciones').doc(ref.inscripcion);
  const ventaRef = db.collection('ventas').doc(String(pago.id));
  let insc;
  await db.runTransaction(async (tx) => {
    const d = await tx.get(inscRef);
    if (!d.exists) throw new Error('Inscripción no encontrada: ' + ref.inscripcion);
    insc = d.data();
    if ((await tx.get(ventaRef)).exists) return;
    tx.set(ventaRef, {
      tipo: 'presencial',
      fecha: FieldValue.serverTimestamp(),
      inscripcion: ref.inscripcion,
      nombre: insc.nombre,
      correo: insc.correo || pago.payer?.email || '',
      telefono: insc.telefono || '',
      nota: insc.nota || '',
      curso: insc.clase,
      titulo: insc.titulo,
      monto: Number(pago.transaction_amount),
      neto: Number(pago.transaction_details?.net_received_amount ?? pago.transaction_amount),
      medio: pago.payment_method_id || ''
    });
    tx.update(inscRef, { estado: 'pagada', pago: String(pago.id), pagada: FieldValue.serverTimestamp() });
  });
  return { estado: 'approved', clase: insc.clase, titulo: insc.titulo, nombre: insc.nombre };
}

/**
 * Valida la firma "x-signature" de las notificaciones de Mercado Pago.
 * https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
 */
export function firmaValida(request, dataId) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) return true; // sin clave configurada no se valida (el pago se consulta igual a la API)
  const partes = Object.fromEntries((request.headers.get('x-signature') || '').split(',').map(p => p.trim().split('=')));
  if (!partes.ts || !partes.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? String(dataId).toLowerCase() : dataId;
  let plantilla = '';
  if (id) plantilla += `id:${id};`;
  const reqId = request.headers.get('x-request-id');
  if (reqId) plantilla += `request-id:${reqId};`;
  plantilla += `ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', secreto).update(plantilla).digest('hex');
  return esperado.length === partes.v1.length && crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1));
}
