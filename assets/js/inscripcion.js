/* Vuelta de Mercado Pago después de pagar una clase presencial.
   Confirma el pago (por si el aviso automático aún no llega) y deja el WhatsApp a mano. */
(async () => {
  const { esc, CONTACTO } = NM;
  const q = new URLSearchParams(location.search);
  const inscripcion = q.get('id');
  const pago = q.get('payment_id') || q.get('collection_id');
  const $ = (id) => document.getElementById(id);
  const mostrar = (titulo, texto, mensaje) => {
    $('i-titulo').textContent = titulo;
    $('i-texto').innerHTML = texto;
    $('i-acciones').innerHTML = `<div class="botones" style="justify-content: center">
      <a class="btn" href="https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}" target="_blank" rel="noopener">Escribirle a Daniela por WhatsApp</a>
      <a class="btn btn-borde" href="cursos">Volver a los cursos</a></div>`;
  };

  let r = {};
  if (inscripcion && pago && pago !== 'null') {
    try {
      const res = await fetch('/api/confirmar-pago', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pago, inscripcion }) });
      r = await res.json().catch(() => ({}));
    } catch (e) {}
  }
  if (r.estado === 'approved') {
    mostrar('¡Listo, tu inscripción está confirmada!',
      `Tu pago de <b>${esc(r.titulo)}</b> está confirmado. Daniela te escribirá para coordinar el horario; si quieres, puedes escribirle tú ahora.`,
      `Hola Daniela, soy ${r.nombre}. Acabo de pagar "${r.titulo}" en tu página y quiero coordinar el horario.`);
  } else if (['pending', 'in_process'].includes(r.estado || q.get('status'))) {
    mostrar('Tu pago está en revisión', 'Mercado Pago todavía no lo aprueba. Apenas lo haga, Daniela recibirá tu inscripción y te escribirá.',
      'Hola Daniela, acabo de pagar una clase en tu página y el pago quedó en revisión.');
  } else if (r.estado || q.get('status') === 'rejected') {
    mostrar('El pago no se aprobó', 'No se cobró nada. Puedes volver a la clase e intentarlo otra vez, o escribirle a Daniela.',
      'Hola Daniela, intenté pagar una clase en tu página pero el pago no se aprobó.');
  } else {
    mostrar('Estamos confirmando tu pago', 'Si ya pagaste, Daniela recibirá tu inscripción en unos minutos. Ante cualquier duda, escríbele.',
      'Hola Daniela, acabo de pagar una clase en tu página.');
  }
})();
