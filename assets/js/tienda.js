/* Ficha de un curso online o de un patrón en PDF (curso.html y patron.html) y compra con Mercado Pago.
   Los dos se compran con cuenta: el acceso lo activa el servidor cuando Mercado Pago confirma el pago,
   y el curso o el PDF quedan en Mis cursos. */
import * as nube from './nube.js';

const { esc, clp } = NM;
const id = new URLSearchParams(location.search).get('id');
const main = document.getElementById('contenido');
const $ = (x) => document.getElementById(x);

const enPatron = /\/patron(\.html)?$/.test(location.pathname);
const [curso, usuario] = await Promise.all([id ? nube.curso(id) : null, nube.usuarioListo()]);
const patron = curso ? NM.esPatron(curso) : enPatron;

if (curso && patron !== enPatron) {
  // Un enlace de curso que en realidad es un patrón (o al revés) va a su ficha
  location.replace((patron ? 'patron' : 'curso') + location.search);
} else if (!curso || !curso.publicado) {
  main.innerHTML = patron
    ? `<section class="banda"><div class="wrap centro"><h1>Patrón no encontrado</h1>
    <p>Puede que ya no esté disponible.</p><a class="btn" href="patrones">Ver patrones</a></div></section>`
    : `<section class="banda"><div class="wrap centro"><h1>Curso no encontrado</h1>
    <p>Puede que ya no esté disponible.</p><a class="btn" href="cursos-online">Ver cursos online</a></div></section>`;
} else {
  document.title = curso.titulo + ' | Daniela Balzo · Negra Mora';
  let tiene = usuario ? (await nube.misCursos(usuario)).includes(curso.id) : false;
  const errorPago = new URLSearchParams(location.search).get('pago') === 'error'
    ? '<p class="error" style="margin-top: 12px">El pago no se completó. No se cobró nada; puedes intentarlo otra vez.</p>' : '';

  // Ficha de un patrón: fotos (la primera grande y las demás para elegir), precio, descripción y detalles
  const pintarPatron = () => {
    const fotos = NM.fotosPatron(curso);
    const cat = NM.categoria(curso);
    const detalles = String(curso.detalles || '').split('\n').map(l => l.trim()).filter(Boolean);
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <a class="volver-categorias" href="patrones#${cat.id}">← ${cat.id === 'otros' ? 'Todos los patrones' : 'Más patrones de ' + esc(cat.nombre)}</a>
        <div class="dos ficha-patron">
          <div class="patron-fotos">
            <img class="principal" id="foto-principal" src="${esc(fotos[0])}" alt="${esc(curso.titulo)}, foto 1">
            ${fotos.length > 1 ? `<div class="miniaturas" role="group" aria-label="Fotos del patrón">${fotos.map((f, i) => `<button type="button" data-foto="${i}" ${i ? '' : 'aria-current="true"'} aria-label="Ver foto ${i + 1}"><img src="${esc(f)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
          </div>
          <div>
            <span class="etiqueta">Patrón en PDF${cat.id === 'otros' ? '' : ' · ' + esc(cat.nombre)}</span>
            <h1>${esc(curso.titulo)}</h1>
            ${curso.resumen ? `<p>${esc(curso.resumen)}</p>` : ''}
            <div class="pie-tarjeta" style="justify-content: flex-start; gap: 20px">
              <span class="precio" style="font-size: 2rem">${tiene ? 'Ya es tuyo' : clp(curso.precio)}</span>
              ${tiene
                ? `<a class="btn" href="aula?curso=${encodeURIComponent(curso.id)}">Descargar mi patrón</a>`
                : `<button class="btn" id="comprar" type="button">Comprar patrón</button>`}
            </div>
            <p class="nota" style="margin-top: 12px">Pago único. Después de pagar, el PDF queda en Mis cursos para descargarlo cuando quieras y te llega un correo con el enlace.</p>
            ${errorPago}
            ${detalles.length ? `<h2 class="ficha-subtitulo">Detalles</h2>
            <ul class="detalles-patron">${detalles.map(l => `<li>${NM.fmt(l)}</li>`).join('')}</ul>` : ''}
            <h2 class="ficha-subtitulo">Incluye</h2>
            <ul class="detalles-patron">
              ${curso.materiales.map(m => `<li>${esc(m.nombre)} (PDF para imprimir)</li>`).join('')}
              <li>Consultas por WhatsApp mientras lo haces</li>
            </ul>
            <p class="nota">¿Dudas antes de comprar? <a href="contacto">Escríbeme</a>.</p>
          </div>
        </div>
      </div>
    </section>`;
    const principal = document.getElementById('foto-principal');
    main.querySelectorAll('[data-foto]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.foto);
      principal.src = fotos[i];
      principal.alt = `${curso.titulo}, foto ${i + 1}`;
      main.querySelectorAll('[data-foto]').forEach(x => x === b ? x.setAttribute('aria-current', 'true') : x.removeAttribute('aria-current'));
    });
    const b = $('comprar');
    if (b) b.addEventListener('click', abrir);
  };

  const pintarCurso = () => {
    main.innerHTML = `
    <section class="banda banda-lila">
      <div class="wrap dos">
        <div>
          <a class="volver-categorias" href="cursos-online#${NM.categoria(curso).id}">← ${NM.categoria(curso).id === 'otros' ? 'Más cursos online' : 'Más cursos de ' + esc(NM.categoria(curso).nombre)}</a>
          <span class="etiqueta">Curso online · Nivel ${NM.nivel(curso).nombre.toLowerCase()} · ${curso.lecciones.length} clases en video</span>
          <h1>${esc(curso.titulo)}</h1>
          <p>${esc(curso.resumen)}</p>
          <div class="pie-tarjeta" style="justify-content: flex-start; gap: 20px">
            <span class="precio" style="font-size: 2rem">${tiene ? 'Ya es tuyo' : clp(curso.precio)}</span>
            ${tiene
              ? `<a class="btn" href="aula?curso=${encodeURIComponent(curso.id)}">Ir a mis cursos</a>`
              : `<button class="btn" id="comprar" type="button">Comprar curso</button>`}
          </div>
          <p class="nota" style="margin-top: 12px">Pago único. Acceso a los videos y materiales cuando quieras.</p>
          ${errorPago}
        </div>
        <img class="foto" src="${esc(NM.imagen(curso))}" alt="">
      </div>
    </section>
    <section class="banda">
      <div class="wrap dos" style="align-items: start">
        <div>
          <h2>Qué vas a aprender</h2>
          <ol class="linea-tiempo">
            ${curso.lecciones.map((l, i) => `<li><b>Clase ${i + 1}</b><span>${esc(l.titulo)}${l.duracion ? ` <span class="nota">· ${esc(l.duracion)}</span>` : ''}</span></li>`).join('')}
          </ol>
        </div>
        <div class="ficha">
          <h3>Incluye</h3>
          <ul>
            <li>${curso.lecciones.length} clases en video para ver cuando quieras</li>
            ${curso.materiales.map(m => `<li>${esc(m.nombre)}</li>`).join('')}
            <li>Consultas por WhatsApp mientras haces el curso</li>
          </ul>
          <h3 style="margin-top: 18px">Necesitas</h3>
          <p>${curso.requisitos ? esc(curso.requisitos) : 'Una máquina de coser que funcione y materiales básicos de costura.'} ¿Dudas? <a href="contacto">Escríbeme</a>.</p>
        </div>
      </div>
    </section>`;
    const b = $('comprar');
    if (b) b.addEventListener('click', abrir);
  };
  const pintar = patron ? pintarPatron : pintarCurso;

  // ---------- Compra ----------
  const modal = $('modal');
  let modoEntrar = false;

  function abrir() {
    const u = nube.usuarioActual();
    $('modal-titulo').textContent = patron ? 'Comprar patrón' : 'Comprar curso';
    $('m-nota-cuenta').textContent = `Con este correo y contraseña entrarás a Mis cursos para ${patron ? 'descargar el patrón' : 'ver el curso'}.`;
    $('m-curso').textContent = curso.titulo;
    $('m-precio').textContent = clp(curso.precio);
    $('campos-cuenta').hidden = !!u;
    // Con sesión iniciada los campos quedan ocultos: si siguen obligatorios, el navegador bloquea el envío.
    $('m-correo').required = $('m-clave').required = !u;
    $('m-ya-cuenta').textContent = u ? `Comprarás con tu cuenta ${u.email}.` : '';
    $('m-error').textContent = '';
    cambiarModo(false);
    $('paso-cuenta').hidden = false;
    $('paso-pagando').hidden = true;
    modal.hidden = false;
    (u ? modal.querySelector('.mp') : $('m-nombre')).focus();
  }

  // Alterna entre "crear cuenta" y "ya tengo cuenta"
  function cambiarModo(entrar) {
    modoEntrar = entrar;
    $('m-campo-nombre').hidden = entrar;
    $('m-nombre').required = !entrar && !nube.usuarioActual();
    $('m-clave').autocomplete = entrar ? 'current-password' : 'new-password';
    $('m-etiqueta-clave').firstChild.textContent = entrar ? 'Contraseña' : 'Crea una contraseña';
    $('m-modo').textContent = entrar ? '¿Primera vez? Crea tu cuenta' : '¿Ya tienes cuenta? Entra aquí';
    $('m-olvide').hidden = !entrar;
  }
  $('m-modo').onclick = () => { cambiarModo(!modoEntrar); $('m-error').textContent = ''; };
  $('m-olvide').onclick = async () => {
    const correo = $('m-correo').value.trim();
    if (!correo) { $('m-error').textContent = 'Escribe tu correo y vuelve a hacer clic.'; return; }
    try { await nube.recuperarClave(correo); } catch (e) {}
    $('m-error').textContent = 'Si ese correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.';
  };

  const cerrar = () => { modal.hidden = true; };
  modal.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = cerrar);
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  $('paso-cuenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = modal.querySelector('.mp');
    boton.disabled = true;
    $('m-error').textContent = '';
    try {
      let u = nube.usuarioActual();
      if (!u) {
        const correo = $('m-correo').value.trim();
        const clave = $('m-clave').value;
        u = modoEntrar ? await nube.entrar(correo, clave) : await nube.crearCuenta($('m-nombre').value.trim(), correo, clave);
      }
      if ((await nube.misCursos(u)).includes(curso.id)) { tiene = true; cerrar(); pintar(); return; }
      $('paso-cuenta').hidden = true;
      $('paso-pagando').hidden = false;
      const { url } = await nube.crearPago(curso.id);
      location.href = url;
    } catch (err) {
      $('paso-cuenta').hidden = false;
      $('paso-pagando').hidden = true;
      if (err.code === 'auth/email-already-in-use') cambiarModo(true);
      $('m-error').textContent = err.code ? nube.mensajeError(err) : (err.message || 'No pudimos conectar con Mercado Pago. Intenta de nuevo.');
    } finally {
      boton.disabled = false;
    }
  });

  pintar();
}
