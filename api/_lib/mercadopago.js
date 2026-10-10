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

// La referencia viaja en el pago y vuelve en la confirmación: "uid|cursoId|precio".
export const referencia = (uid, cursoId, precio) => [uid, cursoId, precio].join('|');
function leerReferencia(ref) {
  const [uid, curso, precio] = String(ref || '').split('|');
  return uid && curso && precio ? { uid, curso, precio: Number(precio) } : null;
}

/** Crea la preferencia de pago y devuelve la URL del checkout. */
export async function crearPreferencia({ curso, usuario, base }) {
  const ref = referencia(usuario.uid, curso.id, curso.precio);
  if (SIMULADO) {
    return `${base}/api/simular-pago?ref=${encodeURIComponent(ref)}`;
  }
  const p = await mp('/checkout/preferences', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      items: [{ id: curso.id, title: curso.titulo, quantity: 1, unit_price: curso.precio, currency_id: 'CLP' }],
      payer: { email: usuario.email },
      external_reference: ref,
      back_urls: {
        success: `${base}/aula.html?pago=ok&curso=${encodeURIComponent(curso.id)}`,
        pending: `${base}/aula.html?pago=ok&curso=${encodeURIComponent(curso.id)}`,
        failure: `${base}/curso.html?id=${encodeURIComponent(curso.id)}&pago=error`
      },
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
 * Revisa el pago y, si está aprobado, da acceso al curso y registra la venta.
 * Se puede llamar varias veces con el mismo pago: solo lo registra una vez.
 */
export async function registrarPago(pago) {
  if (pago.status !== 'approved') return { estado: pago.status };
  const ref = leerReferencia(pago.external_reference);
  if (!ref) throw new Error('Pago sin referencia válida: ' + pago.id);
  if (pago.currency_id !== 'CLP' || Number(pago.transaction_amount) < ref.precio) {
    throw new Error(`Monto o moneda no coinciden en el pago ${pago.id}`);
  }

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
