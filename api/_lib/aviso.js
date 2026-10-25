/* Correos de cada venta (curso online, patrón en PDF o clase presencial), enviados con Resend (https://resend.com):
   - aviso a Daniela con los datos de quien pagó (AVISO_CORREO),
   - confirmación a quien compró o se inscribió (necesita el dominio verificado en Resend).
   RESEND_API_KEY y AVISO_CORREO en Vercel. Sin RESEND_API_KEY los correos solo se escriben en el registro (así se ven en local).
   Si un correo falla, la venta queda registrada igual. */

const pesos = (n) => '$' + Number(n || 0).toLocaleString('es-CL');
const escapar = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const whatsapp = (tel) => { const n = String(tel || '').replace(/\D/g, ''); return n.length === 9 ? '56' + n : n; };
const sitio = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const correosDaniela = () => (process.env.AVISO_CORREO || '').split(',').map(c => c.trim()).filter(Boolean);

// Colores del sitio (assets/css/styles.css). Los correos van con tablas y estilos en línea para que se vean igual en Gmail, Outlook y el celular.
const C = { morado: '#180051', morado2: '#221068', rosa: '#f2c6e6', rosaFuerte: '#c77dba', lila: '#f8f3ff', linea: '#e3d9ef', tinta: '#1f1a2b', gris: '#5b5566', ok: '#1d7a4f' };
const LETRA = "'Open Sans', 'Segoe UI', Arial, sans-serif";

const datos = (filas) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${C.lila}; border: 1px solid ${C.linea}; border-radius: 8px; margin: 0 0 24px">
${filas.filter(Boolean).map(([k, v], i) => `<tr><td style="padding: 12px 18px; ${i ? `border-top: 1px solid ${C.linea};` : ''} font-size: 13px; color: ${C.gris}; white-space: nowrap; vertical-align: top">${k}</td><td style="padding: 12px 18px; ${i ? `border-top: 1px solid ${C.linea};` : ''} font-size: 15px; color: ${C.tinta}; font-weight: 600; text-align: right">${v}</td></tr>`).join('\n')}
</table>`;
const boton = (href, texto, fondo = C.morado2) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 12px"><tr><td style="background: ${fondo}; border-radius: 6px"><a href="${href}" style="display: inline-block; padding: 13px 26px; font-family: ${LETRA}; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none">${texto}</a></td></tr></table>`;
const enlace = (href, texto) => `<a href="${href}" style="color: ${C.morado2}; font-weight: 600">${texto}</a>`;
const parrafo = (texto, estilo = '') => `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${C.tinta}; ${estilo}">${texto}</p>`;
const monto = (n) => `<span style="font-size: 18px; color: ${C.morado}">${pesos(n)}</span>`;

function marco({ previa, etiqueta, titulo, cuerpo }) {
  const base = sitio();
  const logo = base ? `<td width="66" style="padding-right: 14px"><img src="${base}/assets/img/logo-icono.jpg" width="52" height="52" alt="Negra Mora" style="display: block; border-radius: 50%; border: 2px solid ${C.rosa}"></td>` : '';
  const pie = base ? ` · <a href="${base}" style="color: ${C.gris}">${base.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin: 0; padding: 0; background: ${C.lila}">
<div style="display: none; max-height: 0; overflow: hidden; opacity: 0">${previa}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${C.lila}; font-family: ${LETRA}"><tr><td align="center" style="padding: 28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 14px 34px -18px rgba(24, 0, 81, .35)">
<tr><td style="background: ${C.morado}; padding: 22px 28px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${logo}<td>
<div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: .02em">Negra Mora</div>
<div style="font-size: 13px; color: ${C.rosa}">Daniela Balzo · costura y bordado</div></td></tr></table></td></tr>
<tr><td style="height: 4px; line-height: 4px; font-size: 0; background: ${C.rosaFuerte}">&nbsp;</td></tr>
<tr><td style="padding: 32px 28px 12px">
<div style="font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: ${C.rosaFuerte}; margin: 0 0 8px">${etiqueta}</div>
<h1 style="margin: 0 0 20px; font-size: 23px; line-height: 1.3; color: ${C.morado}">${titulo}</h1>
${cuerpo}
</td></tr>
</table>
<p style="margin: 18px 0 0; font-size: 12px; color: ${C.gris}">Negra Mora${pie}</p>
</td></tr></table>
</body></html>`;
}

function aviso(venta) {
  const base = sitio();
  const presencial = venta.tipo === 'presencial';
  const nombre = escapar(venta.nombre) || 'Alguien';
  const asunto = `${presencial ? 'Nueva inscripción' : 'Nueva venta'}: ${venta.titulo}`;
  const saludo = String(venta.nombre || '').trim().split(/\s+/)[0];
  const wa = presencial && venta.telefono &&
    `https://wa.me/${whatsapp(venta.telefono)}?text=${encodeURIComponent(`Hola${saludo ? ' ' + saludo : ''}, soy Daniela de Negra Mora. Te escribo para coordinar el horario de ${venta.titulo}.`)}`;
  const nota = presencial && venta.nota &&
    `<div style="margin: 0 0 24px; padding: 12px 16px; border-left: 3px solid ${C.rosaFuerte}; background: #fdf6fb; font-size: 15px; line-height: 1.6; color: ${C.tinta}"><div style="font-size: 12px; color: ${C.gris}; margin-bottom: 4px">Dejó esta nota</div>${escapar(venta.nota).replace(/\n/g, '<br>')}</div>`;
  const html = marco({
    previa: `${venta.nombre || 'Alguien'} pagó ${pesos(venta.monto)} por ${venta.titulo}.`,
    etiqueta: presencial ? 'Nueva inscripción' : 'Nueva venta',
    titulo: `${nombre} ${presencial ? 'se inscribió en' : 'compró'} ${escapar(venta.titulo)}`,
    cuerpo: `${datos([
      ['Nombre', nombre],
      ['Correo', `<a href="mailto:${escapar(venta.correo)}" style="color: ${C.morado2}">${escapar(venta.correo)}</a>`],
      wa && ['WhatsApp', `<a href="${wa}" style="color: ${C.morado2}">${escapar(venta.telefono)}</a>`],
      ['Pagó', monto(venta.monto)]
    ])}
${nota || ''}
${parrafo(presencial ? 'Escríbele para coordinar el horario.' : venta.tipo === 'patron'
    ? 'Ya puede descargar el patrón desde Mis cursos, no tienes que hacer nada más.'
    : 'Ya tiene acceso al curso en Mis cursos, no tienes que hacer nada más.')}
${wa ? boton(wa, 'Escribirle por WhatsApp', C.ok) : ''}
${base ? parrafo(enlace(`${base}/panel#ventas`, 'Ver mis ventas en el panel'), 'margin-top: 8px') : ''}`
  });
  return { asunto, html };
}

function confirmacion(venta) {
  const base = sitio();
  const presencial = venta.tipo === 'presencial';
  const patron = venta.tipo === 'patron';
  const nombre = escapar(String(venta.nombre || '').trim().split(/\s+/)[0]);
  const titulo = escapar(venta.titulo);
  const asunto = `${presencial ? 'Inscripción confirmada' : 'Compra confirmada'}: ${venta.titulo}`;
  const siguiente = presencial
    ? `${parrafo('<b>¿Qué sigue?</b>', 'margin-bottom: 6px')}
${parrafo(`Daniela te escribirá ${venta.telefono ? 'por WhatsApp' : 'por correo'} en los próximos días para coordinar el horario de la clase.`)}
${base ? parrafo(`Si prefieres escribirle tú, encuentras sus datos en ${enlace(`${base}/contacto`, 'Contacto')}.`) : ''}`
    : patron
      ? `${parrafo('El PDF queda guardado en Mis cursos: entra con tu cuenta para descargarlo e imprimirlo cuando quieras, las veces que necesites.')}
${base ? boton(`${base}/aula?curso=${encodeURIComponent(venta.curso)}`, 'Descargar mi patrón') : ''}`
      : `${parrafo('Puedes verlo cuando quieras y a tu ritmo, entrando con tu cuenta.')}
${base ? boton(`${base}/aula`, 'Ir a Mis cursos') : ''}`;
  const html = marco({
    previa: presencial ? `Tu lugar en ${venta.titulo} está reservado.` : patron ? `Ya puedes descargar ${venta.titulo}.` : `Ya puedes empezar ${venta.titulo}.`,
    etiqueta: presencial ? 'Inscripción confirmada' : 'Compra confirmada',
    titulo: `¡Hola${nombre ? ' ' + nombre : ''}! ${presencial ? 'Tu lugar está reservado' : patron ? 'Tu patrón ya está listo' : 'Tu curso ya está listo'}`,
    cuerpo: `${parrafo(`Recibimos tu pago de <b>${titulo}</b>.`)}
${datos([
      [presencial ? 'Clase' : patron ? 'Patrón' : 'Curso', titulo],
      ['Pagado', monto(venta.monto)]
    ])}
${siguiente}
<p style="margin: 24px 0 20px; padding-top: 18px; border-top: 1px solid ${C.linea}; font-size: 14px; line-height: 1.6; color: ${C.gris}">Si tienes alguna duda, responde este correo y le llega directo a Daniela.</p>`
  });
  return { asunto, html };
}

async function enviar(etiqueta, { para, responder, asunto, html }) {
  if (!process.env.RESEND_API_KEY || !para.length) {
    console.log(`[${etiqueta}]`, asunto, '→', para.join(', ') || '(sin destinatario)');
    return;
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.AVISO_REMITENTE || 'Negra Mora <onboarding@resend.dev>',
        to: para,
        reply_to: responder || undefined,
        subject: asunto,
        html
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) console.error(`${etiqueta}: Resend respondió`, r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.error(etiqueta, e);
  }
}

/** Avisa a Daniela de una venta nueva y le confirma la compra o inscripción a quien pagó. Nunca lanza error. */
export async function avisarVenta(venta) {
  const daniela = correosDaniela();
  await Promise.all([
    enviar('aviso de venta', { para: daniela, responder: venta.correo, ...aviso(venta) }),
    enviar('confirmación', { para: venta.correo ? [venta.correo] : [], responder: daniela[0], ...confirmacion(venta) })
  ]);
}
