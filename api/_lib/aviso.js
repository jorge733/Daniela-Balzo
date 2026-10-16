/* Correo a Daniela cada vez que se registra una venta (curso online o clase presencial).
   Se envía con Resend (https://resend.com): RESEND_API_KEY y AVISO_CORREO en Vercel.
   Sin RESEND_API_KEY el aviso solo se escribe en el registro (así se ve en local).
   Si el correo falla, la venta queda registrada igual. */

const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
const escapar = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const whatsapp = (tel) => { const n = String(tel || '').replace(/\D/g, ''); return n.length === 9 ? '56' + n : n; };

function contenido(venta) {
  const base = (process.env.SITE_URL || '').replace(/\/$/, '');
  const presencial = venta.tipo === 'presencial';
  const asunto = `${presencial ? 'Nueva inscripción' : 'Nueva venta'}: ${venta.titulo}`;
  const filas = [
    ['Nombre', escapar(venta.nombre) || '(sin nombre)'],
    ['Correo', `<a href="mailto:${escapar(venta.correo)}">${escapar(venta.correo)}</a>`],
    presencial && venta.telefono && ['WhatsApp', `<a href="https://wa.me/${whatsapp(venta.telefono)}">${escapar(venta.telefono)}</a>`],
    ['Pagó', pesos(venta.monto)],
    presencial && venta.nota && ['Nota', escapar(venta.nota).replace(/\n/g, '<br>')]
  ].filter(Boolean);
  const html = `<div style="font-family: system-ui, sans-serif; color: #1d1530; max-width: 480px">
<h2 style="font-size: 1.2rem">${presencial ? 'Alguien se inscribió en' : 'Alguien compró'} ${escapar(venta.titulo)}</h2>
<table style="border-collapse: collapse">${filas.map(([k, v]) => `<tr><td style="padding: 4px 12px 4px 0; color: #6b6280">${k}</td><td style="padding: 4px 0">${v}</td></tr>`).join('')}</table>
<p>${presencial ? 'Escríbele para coordinar el horario.' : 'Ya tiene acceso al curso en Mis cursos.'}</p>
${base ? `<p><a href="${base}/panel#ventas">Ver mis ventas en el panel</a></p>` : ''}
</div>`;
  return { asunto, html };
}

/** Avisa a Daniela de una venta nueva. Nunca lanza error. */
export async function avisarVenta(venta) {
  const { asunto, html } = contenido(venta);
  const para = process.env.AVISO_CORREO;
  if (!process.env.RESEND_API_KEY || !para) {
    console.log('[aviso de venta]', asunto, '·', venta.nombre, venta.correo, venta.telefono || '');
    return;
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.AVISO_REMITENTE || 'Negra Mora <onboarding@resend.dev>',
        to: para.split(',').map(c => c.trim()).filter(Boolean),
        reply_to: venta.correo || undefined,
        subject: asunto,
        html
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) console.error('aviso de venta: Resend respondió', r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.error('aviso de venta', e);
  }
}
