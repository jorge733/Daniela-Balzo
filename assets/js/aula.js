/* Aula virtual: inicio de sesión, "Mis carpetas" y reproductor de clases. */
import * as nube from './nube.js';

const { esc } = NM;
const main = document.getElementById('contenido');
const params = new URLSearchParams(location.search);

// Íconos
const ICO = {
  carpeta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  candado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
};

const cargando = (texto = 'Cargando…') => {
  main.innerHTML = `<section class="banda"><div class="wrap"><p class="vacio">${esc(texto)}</p></div></section>`;
};

function login() {
  main.innerHTML = `
  <section class="banda banda-lila">
    <div class="wrap" style="max-width: 460px">
      <h1>Mis cursos</h1>
      <p>Entra con el correo y la contraseña que usaste al comprar tu curso.</p>
      <form class="form" id="f-login">
        <label>Correo<input id="l-correo" type="email" autocomplete="email" required></label>
        <label>Contraseña<input id="l-clave" type="password" autocomplete="current-password" required></label>
        <p class="error" id="l-error" role="alert"></p>
        <button class="btn" type="submit">Entrar</button>
        <p class="nota"><button class="enlace" type="button" id="l-olvide">¿Olvidaste tu contraseña?</button></p>
        <p class="nota">¿Aún no tienes cursos? <a href="cursos-online">Mira los cursos online</a>.</p>
      </form>
    </div>
  </section>`;
  const error = document.getElementById('l-error');
  document.getElementById('f-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.target.querySelector('[type=submit]');
    boton.disabled = true;
    error.textContent = '';
    try {
      await nube.entrar(document.getElementById('l-correo').value.trim(), document.getElementById('l-clave').value);
      render();
    } catch (err) {
      error.textContent = nube.mensajeError(err);
      boton.disabled = false;
    }
  });
  document.getElementById('l-olvide').onclick = async () => {
    const correo = document.getElementById('l-correo').value.trim();
    if (!correo) { error.textContent = 'Escribe tu correo y vuelve a hacer clic.'; return; }
    try { await nube.recuperarClave(correo); } catch (e) {}
    error.textContent = 'Si ese correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.';
  };
}

const avance = (prog, c) => {
  const hechas = prog[c.id] || [];
  return c.lecciones.length ? Math.round(100 * hechas.filter(i => i < c.lecciones.length).length / c.lecciones.length) : 0;
};

function misCarpetas(u, cursos, prog, aviso = '') {
  main.innerHTML = `
  <section class="banda">
    <div class="wrap">
      <div class="pie-tarjeta" style="margin-bottom: 28px; padding: 0">
        <div><h1 style="margin: 0">Hola${(u.displayName || '').trim() ? ', ' + esc(u.displayName.trim().split(' ')[0]) : ''}</h1><p class="nota" style="margin: 0">${esc(u.email)}</p></div>
        <button class="btn btn-borde btn-chico" id="salir" type="button">Cerrar sesión</button>
      </div>
      ${aviso}
      <h2 class="hilo">Mis carpetas</h2>
      <p class="nota">Cada curso que compras tiene su carpeta exclusiva con los videos y materiales. Solo tú puedes abrirla.</p>
      ${cursos.length ? `<div class="tarjetas" style="margin-top: 24px">${cursos.map(c => {
        const p = avance(prog, c);
        return `<a class="tarjeta carpeta-tarjeta" href="aula?curso=${encodeURIComponent(c.id)}">
          <div class="img"><img src="${esc(NM.imagen(c))}" alt="" loading="lazy">
            <span class="chip chip-carpeta">${ICO.carpeta} Carpeta del curso</span></div>
          <div class="cuerpo">
            <h3>${esc(c.titulo)}</h3>
            <p class="contenido-carpeta">${ICO.video} ${c.lecciones.length} videos <span>·</span> ${ICO.pdf} ${c.materiales.length} materiales</p>
            <div class="barra" aria-label="Avance ${p}%"><span style="width: ${p}%"></span></div>
            <div class="pie-tarjeta"><span class="nota">${p}% completado</span><span class="flecha">${p ? 'Continuar' : 'Abrir carpeta'} </span></div>
          </div>
        </a>`;
      }).join('')}</div>` : `<p class="vacio">Todavía no tienes cursos. <a href="cursos-online">Ver cursos online</a></p>`}
    </div>
  </section>`;
  document.getElementById('salir').onclick = async () => { await nube.salir(); history.replaceState(null, '', 'aula'); render(); };
}

function verCurso(u, c, prog, i) {
  const hechas = prog[c.id] = prog[c.id] || [];
  const l = c.lecciones[i];
  const p = avance(prog, c);
  main.innerHTML = `
  <section class="banda">
    <div class="wrap">
      <nav class="ruta" aria-label="Ubicación"><a href="aula">Mis carpetas</a><span aria-hidden="true">/</span><span>${esc(c.titulo)}</span></nav>
      <div class="pie-tarjeta" style="padding: 0; align-items: flex-end">
        <div>
          <span class="etiqueta exclusiva">${ICO.candado} Carpeta exclusiva · solo para ti</span>
          <h1 style="margin: 0">${esc(c.titulo)}</h1>
        </div>
        <div style="min-width: 200px; flex: 0 1 260px">
          <p class="nota" style="margin: 0 0 6px">${p}% completado</p>
          <div class="barra"><span style="width: ${p}%"></span></div>
        </div>
      </div>
      <div class="aula" style="margin-top: 28px">
        <aside class="carpeta" aria-label="Contenido de la carpeta">
          <div class="carpeta-titulo">${ICO.carpeta} Videos <span>${c.lecciones.length}</span></div>
          <ol class="lecciones">
            ${c.lecciones.map((x, j) => `<li><button type="button" data-i="${j}" class="${hechas.includes(j) ? 'hecha' : ''}" ${j === i ? 'aria-current="true"' : ''}>
              <span class="check" aria-hidden="true"></span><span>Clase ${j + 1}: ${esc(x.titulo)}<br><span class="nota">${ICO.video} ${esc(x.duracion || (x.video ? 'video' : 'pronto'))}</span></span></button></li>`).join('')}
          </ol>
          ${c.materiales.length ? `<div class="carpeta-titulo">${ICO.carpeta} Materiales <span>${c.materiales.length}</span></div>
          <ul class="archivos">${c.materiales.map((m, k) => `<li><button type="button" data-material="${k}">${ICO.pdf}<span>${esc(m.nombre)}</span><span class="descargar">Descargar</span></button></li>`).join('')}</ul>` : ''}
        </aside>
        <div>
          <div class="video" id="video">
            ${l.video ? '<div><p class="nota" style="color: #e6dcf5">Cargando video…</p></div>' : `<div><div class="play" aria-hidden="true">▶</div>
              <b>Clase ${i + 1}: ${esc(l.titulo)}</b><br>
              <span class="nota" style="color: #e6dcf5">Daniela todavía no sube este video. Vuelve pronto.</span></div>`}
          </div>
          <div class="pie-tarjeta" style="padding-top: 16px">
            <label style="display: flex; gap: 8px; align-items: center; font-weight: 600">
              <input type="checkbox" id="hecha" ${hechas.includes(i) ? 'checked' : ''}> Marcar clase como terminada
            </label>
            <div class="botones">
              ${i > 0 ? `<button class="btn btn-borde btn-chico" data-i="${i - 1}" type="button">Anterior</button>` : ''}
              ${i < c.lecciones.length - 1 ? `<button class="btn btn-chico" data-i="${i + 1}" type="button">Siguiente clase</button>` : ''}
            </div>
          </div>
          <p class="error" id="aula-error" role="alert"></p>
          <p class="nota" style="margin-top: 20px">¿Dudas con esta clase? <a href="https://wa.me/${NM.CONTACTO.whatsapp}" target="_blank" rel="noopener">Escríbele a Daniela por WhatsApp</a>.</p>
        </div>
      </div>
    </div>
  </section>`;
  const error = document.getElementById('aula-error');

  if (l.video) {
    nube.enlaceArchivo(c.id, l.video).then(({ url }) => {
      const v = document.createElement('video');
      v.controls = true;
      v.preload = 'metadata';
      v.setAttribute('controlsList', 'nodownload');
      v.setAttribute('playsinline', '');
      v.oncontextmenu = (e) => e.preventDefault();
      v.src = url;
      document.getElementById('video').replaceChildren(v);
    }).catch(() => {
      document.getElementById('video').innerHTML = '<div><p class="nota" style="color: #e6dcf5">No pudimos cargar el video. Recarga la página para intentarlo otra vez.</p></div>';
    });
  }

  main.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    history.replaceState(null, '', `aula?curso=${encodeURIComponent(c.id)}&clase=${Number(b.dataset.i) + 1}`);
    verCurso(u, c, prog, Number(b.dataset.i));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  main.querySelectorAll('[data-material]').forEach(b => b.onclick = async () => {
    // La pestaña se abre antes de pedir el enlace para que el navegador no la bloquee.
    const pestaña = window.open('', '_blank');
    try {
      const { url } = await nube.enlaceArchivo(c.id, c.materiales[Number(b.dataset.material)].ruta);
      if (pestaña) pestaña.location = url; else location.href = url;
    } catch (e) {
      if (pestaña) pestaña.close();
      error.textContent = 'No pudimos abrir el archivo. Intenta otra vez.';
    }
  });
  document.getElementById('hecha').onchange = async (e) => {
    const k = hechas.indexOf(i);
    if (e.target.checked && k < 0) hechas.push(i);
    if (!e.target.checked && k >= 0) hechas.splice(k, 1);
    try {
      await nube.guardarAvance(c.id, hechas, u);
      verCurso(u, c, prog, i);
    } catch (err) {
      error.textContent = 'No se pudo guardar tu avance. Revisa tu conexión.';
    }
  };
}

// Al volver de Mercado Pago: confirma el pago por si el aviso automático aún no llega.
async function confirmarRegreso() {
  const pago = params.get('payment_id') || params.get('collection_id');
  if (params.get('pago') !== 'ok' || !pago || pago === 'null') return '';
  cargando('Confirmando tu pago…');
  history.replaceState(null, '', 'aula');
  try {
    const r = await nube.confirmarPago(pago);
    if (r.estado === 'approved') return '<p class="exito">¡Pago aprobado! Ya tienes acceso a tu curso. Mercado Pago te enviará el comprobante a tu correo.</p>';
    if (r.estado === 'pending' || r.estado === 'in_process') return '<p class="aviso-suave">Tu pago está en revisión. Apenas Mercado Pago lo apruebe, el curso aparecerá aquí.</p>';
    return '<p class="error">El pago no se aprobó. No se cobró nada; puedes intentarlo otra vez desde el curso.</p>';
  } catch (e) {
    return '<p class="aviso-suave">Estamos confirmando tu pago con Mercado Pago. Si no ves tu curso en unos minutos, recarga esta página.</p>';
  }
}

async function render() {
  cargando();
  const u = await nube.usuarioListo();
  if (!u) return login();
  const aviso = await confirmarRegreso();
  const [ids, prog] = await Promise.all([nube.misCursos(u), nube.progreso(u)]);
  const cursos = (await Promise.all(ids.map(nube.curso))).filter(Boolean);
  const c = cursos.find(x => x.id === params.get('curso'));
  if (c && c.lecciones.length && !aviso) {
    const clase = Math.min(Math.max(Number(params.get('clase')) || 1, 1), c.lecciones.length) - 1;
    return verCurso(u, c, prog, clase);
  }
  misCarpetas(u, cursos, prog, aviso);
}

render();
