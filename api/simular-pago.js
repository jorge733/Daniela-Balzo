/* GET /api/simular-pago?ref=...  (solo en local, sin credenciales de Mercado Pago)
   Reemplaza el checkout para probar la compra completa con los emuladores. */
import { db } from './_lib/firebase.js';
import { SIMULADO, registrarPago, ficha } from './_lib/mercadopago.js';
import { sitio } from './_lib/util.js';

const pagina = (ref) => `<!doctype html><html lang="es"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Pago simulado</title>
<body style="font-family: system-ui, sans-serif; max-width: 420px; margin: 60px auto; padding: 0 16px; color: #1d1530">
<h1 style="font-size: 1.4rem">Mercado Pago (simulado)</h1>
<p>Esta pantalla reemplaza a Mercado Pago mientras se prueba el sitio en local. No se cobra nada.</p>
<p><a href="?ref=${encodeURIComponent(ref)}&resultado=approved" style="display: block; background: #009ee3; color: #fff; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; margin: 8px 0">Aprobar pago</a>
<a href="?ref=${encodeURIComponent(ref)}&resultado=rejected" style="display: block; border: 1px solid #ccc; padding: 12px; border-radius: 6px; text-align: center; text-decoration: none; color: inherit">Rechazar pago</a></p>
</body></html>`;

export async function GET(request) {
  if (!SIMULADO) return new Response('No disponible', { status: 404 });
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref') || '';
  const resultado = url.searchParams.get('resultado');
  const [, curso, precio] = ref.split('|');
  if (!curso) return new Response('Referencia inválida', { status: 400 });
  if (!resultado) return new Response(pagina(ref), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  const base = sitio(request);
  // Clase presencial: "insc|inscripcionId|precio"
  const insc = ref.startsWith('insc|') ? (await db.collection('inscripciones').doc(curso).get()).data() : null;
  if (ref.startsWith('insc|') && !insc) return new Response('Inscripción no encontrada', { status: 404 });
  if (resultado !== 'approved') {
    if (insc) return Response.redirect(`${base}/${insc.volver}${insc.volver.includes('?') ? '&' : '?'}pago=error`, 302);
    const doc = await db.collection('cursos').doc(curso).get();
    return Response.redirect(`${base}/${ficha(doc.data() || {})}?id=${encodeURIComponent(curso)}&pago=error`, 302);
  }
  const id = String(Date.now());
  const pago = { id, status: 'approved', external_reference: ref, currency_id: 'CLP', transaction_amount: Number(precio), payment_method_id: 'simulado' };
  await db.collection('_pagos_simulados').doc(id).set(pago);
  await registrarPago(pago); // hace lo mismo que el webhook
  if (insc) return Response.redirect(`${base}/inscripcion?id=${encodeURIComponent(curso)}&payment_id=${id}&status=approved`, 302);
  return Response.redirect(`${base}/aula?pago=ok&curso=${encodeURIComponent(curso)}&payment_id=${id}&status=approved`, 302);
}
