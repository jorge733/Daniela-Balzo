/* Panel privado de Daniela.
   Pensado para usarse sin conocimientos técnicos: una cosa a la vez, palabras simples,
   botones grandes y confirmación antes de borrar.
   Secciones: #inicio, #cursos, #curso/<id>, #presenciales, #presencial/<id>, #talleres, #paginas, #pagina/<id>, #ventas */
import * as nube from './nube.js';

const { esc, clp } = NM;
const main = document.getElementById('contenido');

// Fotos del sitio que se pueden usar como portada de un curso
const FOTOS = ['cursos-05', 'cursos-06', 'cursos-07', 'cursos-02', 'cursos-03', 'cursos-04',
  'clases-online-01', 'clases-online-02', 'clases-online-03', 'inicio-02', 'inicio-03', 'accesorios-01', 'vestuario-01'];

// ---------- Íconos ----------
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICO = {
  inicio: svg('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>'),
  cursos: svg('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2.5v9L17 14"/>'),
  textos: svg('<path d="M4 6h16M4 12h10M4 18h13"/>'),
  presencial: svg('<path d="M6 3v8a6 6 0 0 0 12 0V3"/><path d="M4 21h16"/><circle cx="12" cy="11" r="2"/>'),
  talleres: svg('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.3A5 5 0 0 1 21 19"/>'),
  ventas: svg('<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/><path d="M6 10v.01M18 15v.01"/>'),
  mas: svg('<path d="M12 5v14M5 12h14"/>'),
  ok: svg('<path d="m5 12 5 5 9-10"/>'),
  alerta: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.01"/>'),
  subir: svg('<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>'),
  volver: svg('<path d="M15 18 9 12l6-6"/>'),
  ojo: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  basura: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  arriba: svg('<path d="m6 15 6-6 6 6"/>'),
  abajo: svg('<path d="m6 9 6 6 6-6"/>'),
  izquierda: svg('<path d="m15 18-6-6 6-6"/>'),
  derecha: svg('<path d="m9 18 6-6-6-6"/>'),
  paginas: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  contacto: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  persona: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>'),
  pdf: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
  foto: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  ayuda: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.01"/>')
};

// ---------- Avisos y confirmaciones ----------
function avisar(texto, tipo = 'ok') {
  const t = document.getElementById('toast');
  t.className = 'toast toast-' + tipo;
  t.innerHTML = (tipo === 'ok' ? ICO.ok : ICO.alerta) + `<span>${esc(texto)}</span>`;
  t.hidden = false;
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => t.hidden = true, tipo === 'ok' ? 3500 : 7000);
}

/** Ventana de confirmación. Resuelve true si Daniela acepta. */
function confirmar({ titulo, texto, si = 'Sí', no = 'Cancelar', peligro = false, soloAceptar = false }) {
  return new Promise((ok) => {
    const m = document.createElement('div');
    m.className = 'modal';
    m.setAttribute('role', 'alertdialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="caja">
      <h2 class="confirmar-titulo">${esc(titulo)}</h2>
      <p>${texto}</p>
      <div class="confirmar-botones">
        ${soloAceptar ? '' : `<button class="btn btn-borde" type="button" data-r="no">${esc(no)}</button>`}
        <button class="btn ${peligro ? 'btn-peligro' : ''}" type="button" data-r="si">${esc(si)}</button>
      </div></div>`;
    const cerrar = (r) => { m.remove(); document.removeEventListener('keydown', tecla); ok(r); };
    const tecla = (e) => { if (e.key === 'Escape') cerrar(false); };
    m.addEventListener('click', (e) => {
      if (e.target === m) cerrar(false);
      const b = e.target.closest('[data-r]');
      if (b) cerrar(b.dataset.r === 'si');
    });
    document.addEventListener('keydown', tecla);
    document.body.append(m);
    // El foco parte en "Cancelar": así un Enter apurado nunca borra nada.
    (m.querySelector('[data-r="no"]') || m.querySelector('[data-r="si"]')).focus();
  });
}

// ---------- Estado ----------
let sucio = false;          // hay cambios sin guardar en la pantalla actual
let subiendo = 0;           // archivos subiéndose ahora mismo
let hashAnterior = '';
const marcarSucio = (s) => {
  sucio = s;
  const barra = document.querySelector('.barra-guardar');
  if (barra) barra.classList.toggle('pendiente', s);
  const estado = document.getElementById('estado-guardado');
  if (estado) estado.innerHTML = s ? `${ICO.alerta} Tienes cambios sin guardar` : `${ICO.ok} Todo guardado`;
};
window.addEventListener('beforeunload', (e) => { if (sucio || subiendo) { e.preventDefault(); e.returnValue = ''; } });

// Nombre de archivo seguro para Storage: "Clase 1 (final).mp4" -> "lx2k-clase-1-final.mp4"
const nombreArchivo = (f) => {
  const punto = f.name.lastIndexOf('.');
  const base = (punto > 0 ? f.name.slice(0, punto) : f.name).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'archivo';
  return `${Date.now().toString(36)}-${base}${punto > 0 ? f.name.slice(punto).toLowerCase() : ''}`;
};
// Duración de un video local en segundos (0 si el navegador no la sabe)
const segundosVideo = (archivo) => new Promise((ok) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); ok(Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0); };
  v.onerror = () => ok(0);
  v.src = URL.createObjectURL(archivo);
});
const textoDuracion = (s) => s ? Math.max(1, Math.round(s / 60)) + ' min' : '';
// Un video del celular en 720p pesa unos 45 MB por minuto; en Full HD o 4K, de 60 a 350.
const MB_POR_MINUTO_MAX = 65;
const MB_SIN_DURACION_MAX = 1500;
const mb = (bytes) => bytes > 1e9 ? (bytes / 1e9).toFixed(1).replace('.', ',') + ' GB' : Math.max(1, Math.round(bytes / 1e6)) + ' MB';
const precioTexto = (n) => Number(n || 0).toLocaleString('es-CL');
const soloDigitos = (s) => Number(String(s).replace(/\D/g, '')) || 0;

// ---------- Estructura ----------
const SECCIONES = [
  ['inicio', 'Inicio', ICO.inicio],
  ['cursos', 'Cursos online', ICO.cursos],
  ['presenciales', 'Clases presenciales', ICO.presencial],
  ['talleres', 'Talleres realizados', ICO.talleres],
  ['paginas', 'Mis páginas', ICO.paginas],
  ['ventas', 'Mis ventas', ICO.ventas]
];

function marco(activa, contenido) {
  main.innerHTML = `
  <section class="panel">
    <div class="wrap">
      <div class="panel-cabeza">
        <p class="panel-hola">Hola, ${esc((nube.usuarioActual()?.displayName || 'Daniela').split(' ')[0])}</p>
        <button class="btn btn-borde btn-chico" id="salir" type="button">Cerrar sesión</button>
      </div>
      <nav class="panel-nav" aria-label="Secciones del panel">
        ${SECCIONES.map(([k, t, i]) => `<a href="#${k}" ${k === activa ? 'aria-current="page"' : ''}>${i}<span>${t}</span></a>`).join('')}
      </nav>
      <div id="zona">${contenido}</div>
    </div>
  </section>`;
  document.getElementById('salir').onclick = async () => {
    if (!await salirSinGuardar()) return;
    await nube.salir();
    entrada();
  };
  return document.getElementById('zona');
}

const cargando = (activa) => marco(activa, '<p class="vacio">Cargando…</p>');

async function salirSinGuardar() {
  if (subiendo) {
    await confirmar({ titulo: 'Espera un momento', texto: 'Todavía se está subiendo un archivo. Espera a que termine antes de salir.', si: 'Entendido', soloAceptar: true });
    return false;
  }
  if (!sucio) return true;
  const r = await confirmar({ titulo: '¿Salir sin guardar?', texto: 'Hiciste cambios que todavía no guardas. Si sales ahora, se pierden.', si: 'Salir sin guardar', no: 'Quedarme', peligro: true });
  if (r) marcarSucio(false);
  return r;
}

// ---------- Inicio de sesión ----------
function entrada(error = '') {
  main.innerHTML = `
  <section class="banda banda-lila">
    <div class="wrap" style="max-width: 480px">
      <h1>Tu panel</h1>
      <p>Aquí cambias tu página, creas tus cursos online, subes tus videos y ves tus ventas.</p>
      <form class="form caja-form" id="f-panel">
        <label>Tu correo<input id="p-correo" type="email" autocomplete="email" required></label>
        <label>Tu contraseña<input id="p-clave" type="password" autocomplete="current-password" required></label>
        <p class="error" id="p-error" role="alert">${esc(error)}</p>
        <button class="btn btn-grande" type="submit">Entrar</button>
        <p class="nota"><button class="enlace" type="button" id="p-olvide">Olvidé mi contraseña</button></p>
      </form>
    </div>
  </section>`;
  const err = document.getElementById('p-error');
  document.getElementById('f-panel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = e.target.querySelector('[type=submit]');
    b.disabled = true;
    b.textContent = 'Entrando…';
    try {
      await nube.entrar(document.getElementById('p-correo').value.trim(), document.getElementById('p-clave').value);
      iniciar();
    } catch (x) {
      err.textContent = nube.mensajeError(x);
      b.disabled = false;
      b.textContent = 'Entrar';
    }
  });
  document.getElementById('p-olvide').onclick = async () => {
    const correo = document.getElementById('p-correo').value.trim();
    if (!correo) { err.textContent = 'Primero escribe tu correo arriba y vuelve a hacer clic aquí.'; return; }
    try { await nube.recuperarClave(correo); } catch (x) {}
    err.textContent = 'Listo. Revisa tu correo: te llegará un enlace para crear una contraseña nueva.';
  };
}

// ---------- Inicio ----------
async function inicio() {
  cargando('inicio');
  const [cursos, ventas] = await Promise.all([nube.todosLosCursos(), nube.ventas()]);
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const delMes = ventas.filter(v => fechaDe(v) >= mes);
  const visibles = cursos.filter(c => c.publicado);

  // Cosas por hacer, en lenguaje simple
  const pendientes = [];
  cursos.forEach(c => {
    const faltan = c.lecciones.filter(l => !l.video).length;
    if (c.publicado && faltan) pendientes.push({ c, texto: `<b>${esc(c.titulo)}</b> ya está en tu página, pero ${faltan === 1 ? 'a 1 clase le falta' : `a ${faltan} clases les falta`} el video.` });
    else if (!c.publicado && !faltan && c.lecciones.length) pendientes.push({ c, texto: `<b>${esc(c.titulo)}</b> tiene todos sus videos, pero todavía no se muestra en tu página.` });
  });

  marco('inicio', `
    <div class="resumen-panel">
      <div><span>Ventas este mes</span><b>${delMes.length}</b><small>${clp(delMes.reduce((s, v) => s + (v.monto || 0), 0))}</small></div>
      <div><span>Cursos en tu página</span><b>${visibles.length}</b><small>de ${cursos.length} en total</small></div>
    </div>

    ${pendientes.length ? `<h2 class="panel-titulo">Por hacer</h2>
    <ul class="pendientes">${pendientes.map(p => `<li>${ICO.alerta}<span>${p.texto}</span><a class="btn btn-chico" href="#curso/${encodeURIComponent(p.c.id)}">Completar</a></li>`).join('')}</ul>` : ''}

    <h2 class="panel-titulo">¿Qué quieres hacer?</h2>
    <div class="acciones">
      <button class="accion" type="button" id="accion-nuevo">${ICO.mas}<b>Crear un curso nuevo</b><span>Ponle nombre, precio y sube sus videos.</span></button>
      <a class="accion" href="#cursos">${ICO.cursos}<b>Ver o cambiar mis cursos</b><span>Subir videos, cambiar precios o fotos.</span></a>
      <a class="accion" href="#presenciales">${ICO.presencial}<b>Cambiar mis clases presenciales</b><span>Precios, horarios, textos y fotos.</span></a>
      <a class="accion" href="#talleres">${ICO.talleres}<b>Cambiar mis talleres realizados</b><span>Agregar un taller, sus textos y sus fotos.</span></a>
      <a class="accion" href="#paginas">${ICO.paginas}<b>Cambiar mis páginas</b><span>Textos y fotos de cada página, tu portafolio y tus datos de contacto.</span></a>
      <a class="accion" href="#ventas">${ICO.ventas}<b>Ver mis ventas</b><span>Quién compró, qué curso y cuándo.</span></a>
    </div>`);
  document.getElementById('accion-nuevo').onclick = crearCurso;
}

const fechaDe = (v) => v.fecha && v.fecha.toDate ? v.fecha.toDate() : new Date(v.fecha || 0);

// ---------- Lista de cursos ----------
async function cursos() {
  cargando('cursos');
  const lista = await nube.todosLosCursos();
  marco('cursos', `
    <div class="panel-barra">
      <h2 class="panel-titulo">Mis cursos online en video</h2>
      <button class="btn" type="button" id="nuevo">${ICO.mas} Crear curso nuevo</button>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>Haz clic en un curso para cambiarlo o subirle videos. Solo los cursos marcados como <b>"En tu página"</b> los pueden ver y comprar tus estudiantes.</span></p>
    ${lista.length ? `<div class="lista-cursos">${lista.map(c => {
      const con = c.lecciones.filter(l => l.video).length;
      return `<a class="curso-fila" href="#curso/${encodeURIComponent(c.id)}">
        <img src="${esc(NM.imagen(c))}" alt="">
        <div>
          <b>${esc(c.titulo)}</b>
          <span class="curso-datos">Nivel ${NM.nivel(c).nombre.toLowerCase()} · ${clp(c.precio)} · Videos: ${con} de ${c.lecciones.length}</span>
          ${c.publicado ? `<span class="estado estado-ok">${ICO.ok} En tu página</span>` : '<span class="estado">Oculto (todavía no se muestra)</span>'}
        </div>
        <span class="btn btn-borde btn-chico">Abrir</span>
      </a>`;
    }).join('')}</div>` : `<div class="vacio"><p>Todavía no tienes cursos online.</p><button class="btn" type="button" id="nuevo-vacio">${ICO.mas} Crear mi primer curso</button></div>`}`);
  document.getElementById('nuevo').onclick = crearCurso;
  document.getElementById('nuevo-vacio')?.addEventListener('click', crearCurso);
}

async function crearCurso() {
  const cursos = await nube.todosLosCursos();
  const id = 'curso-' + Date.now().toString(36);
  await nube.guardarCurso({ id, titulo: 'Mi curso nuevo', resumen: '', requisitos: '', nivel: 'basico', precio: 30000, imagen: 'cursos-05.jpg',
    publicado: false, orden: cursos.length, lecciones: [{ titulo: 'Clase 1', duracion: '' }], materiales: [] });
  avisar('Curso creado. Ahora complétalo.');
  location.hash = 'curso/' + id;
}

// ---------- Editor de un curso ----------
async function editarCurso(id) {
  cargando('cursos');
  const c = await nube.curso(id);
  if (!c) {
    marco('cursos', '<div class="vacio"><p>Este curso ya no existe.</p><a class="btn" href="#cursos">Volver a mis cursos</a></div>');
    return;
  }
  c.requisitos = c.requisitos || '';
  pintarEditor(c);
}

function pintarEditor(c) {
  const conVideo = c.lecciones.filter(l => l.video).length;
  const zona = marco('cursos', `
    <a class="volver" href="#cursos">${ICO.volver} Volver a mis cursos</a>
    <div class="panel-barra">
      <h2 class="panel-titulo" id="titulo-editor">${esc(c.titulo)}</h2>
      <a class="btn btn-borde btn-chico" href="curso?id=${encodeURIComponent(c.id)}" target="_blank" rel="noopener">${ICO.ojo} Ver cómo se ve</a>
    </div>

    <form id="f-curso" class="editor" novalidate>
      <section class="paso">
        <h3><span class="num">1</span> Datos del curso</h3>
        <label>Nombre del curso
          <input name="titulo" value="${esc(c.titulo)}" maxlength="120" required></label>
        <fieldset class="niveles">
          <legend>Nivel del curso <small>Tus cursos se ordenan en la página de lo más simple a lo más avanzado.</small></legend>
          ${NM.NIVELES.map(nv => `<label class="nivel-opcion">
            <input type="radio" name="nivel" value="${nv.id}" ${NM.nivel(c).id === nv.id ? 'checked' : ''}>
            <span><b>${nv.nombre}</b><small>${nv.titulo}</small></span>
          </label>`).join('')}
        </fieldset>
        <label>Precio
          <span class="campo-precio"><span>$</span><input name="precio" inputmode="numeric" value="${precioTexto(c.precio)}" required></span>
          <small>En pesos chilenos. Mercado Pago descuenta su comisión de cada venta.</small></label>
        <label>Descripción
          <textarea name="resumen" rows="4" maxlength="600" placeholder="Ej: En 4 clases aprenderás a usar tu máquina y harás 3 proyectos simples.">${esc(c.resumen)}</textarea>
          <small>2 o 3 líneas: qué se aprende y qué se va a hacer.</small></label>
        <label>¿Qué se necesita para el curso?
          <input name="requisitos" value="${esc(c.requisitos)}" maxlength="300" placeholder="Ej: una máquina de coser recta, tijeras y alfileres.">
          <small>Opcional. Si lo dejas vacío, dice "una máquina de coser y materiales básicos".</small></label>
      </section>

      <section class="paso">
        <h3><span class="num">2</span> Foto del curso</h3>
        <p class="ayuda-chica">Toca la foto que quieras usar, o sube una tuya.</p>
        <div class="fotos-elegir" role="radiogroup" aria-label="Foto del curso">
          ${/^https?:/.test(c.imagen) ? `<button type="button" role="radio" aria-checked="true" data-foto="${esc(c.imagen)}"><img src="${esc(c.imagen)}" alt="Tu foto"></button>` : ''}
          ${FOTOS.map(f => `<button type="button" role="radio" aria-checked="${c.imagen === f + '.jpg'}" data-foto="${f}.jpg"><img src="assets/img/${f}.jpg" alt="" loading="lazy"></button>`).join('')}
        </div>
        <label class="btn btn-borde subir-archivo">${ICO.foto} Subir una foto mía<input type="file" accept="image/*" id="subir-foto" hidden></label>
      </section>

      <section class="paso">
        <h3><span class="num">3</span> Clases y videos <span class="contador">${conVideo} de ${c.lecciones.length} con video</span></h3>
        <p class="ayuda-chica">Cada clase es un video. Los videos se guardan solos apenas terminan de subir. Usa videos <b>MP4</b>, que es como graba el celular.</p>
        <ol class="clases">
          ${c.lecciones.map((l, j) => `<li class="clase" data-j="${j}">
            <div class="clase-cabeza">
              <span class="clase-num">Clase ${j + 1}</span>
              <div class="clase-mover">
                <button type="button" class="icono" data-subir-clase="${j}" ${j === 0 ? 'disabled' : ''} aria-label="Mover la clase ${j + 1} hacia arriba">${ICO.arriba}</button>
                <button type="button" class="icono" data-bajar-clase="${j}" ${j === c.lecciones.length - 1 ? 'disabled' : ''} aria-label="Mover la clase ${j + 1} hacia abajo">${ICO.abajo}</button>
                <button type="button" class="icono peligro" data-quitar-clase="${j}" aria-label="Quitar la clase ${j + 1}">${ICO.basura}</button>
              </div>
            </div>
            <label class="oculta-etiqueta">Nombre de la clase ${j + 1}<input name="leccion" data-j="${j}" value="${esc(l.titulo)}" maxlength="120"></label>
            <div class="clase-video">
              ${l.video
                ? `<span class="estado estado-ok">${ICO.ok} Video listo${l.duracion ? ' · ' + esc(l.duracion) : ''}</span>
                   <label class="btn btn-borde btn-chico">Cambiar video<input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm" data-video="${j}" hidden></label>`
                : `<span class="estado estado-falta">Falta el video</span>
                   <label class="btn btn-chico">${ICO.subir} Subir video<input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm" data-video="${j}" hidden></label>`}
            </div>
            <div class="subida" hidden><div class="progreso"><span></span></div><p></p></div>
          </li>`).join('')}
        </ol>
        <button class="btn btn-borde" type="button" id="agregar-clase">${ICO.mas} Agregar otra clase</button>
      </section>

      <section class="paso">
        <h3><span class="num">4</span> Materiales para descargar</h3>
        <p class="ayuda-chica">Moldes, patrones o listas en PDF. Tus estudiantes los descargan desde Mis cursos. Es opcional.</p>
        ${c.materiales.length ? `<ul class="materiales">${c.materiales.map((m, k) => `<li>${ICO.pdf}<span>${esc(m.nombre)}</span>
          <button type="button" class="icono peligro" data-quitar-material="${k}" aria-label="Quitar ${esc(m.nombre)}">${ICO.basura}</button></li>`).join('')}</ul>` : ''}
        <label class="btn btn-borde subir-archivo">${ICO.subir} Subir un material<input type="file" accept=".pdf,image/*" id="subir-material" hidden></label>
        <div class="subida" id="subida-material" hidden><div class="progreso"><span></span></div><p></p></div>
      </section>

      <section class="paso">
        <h3><span class="num">5</span> ¿Mostrarlo en tu página?</h3>
        <label class="interruptor">
          <input type="checkbox" name="publicado" ${c.publicado ? 'checked' : ''}>
          <span class="pista" aria-hidden="true"></span>
          <span><b>Mostrar este curso en mi página</b><br><small>Si está apagado, el curso queda oculto: nadie lo ve ni lo puede comprar.</small></span>
        </label>
        <p class="aviso-publicar" id="aviso-publicar" hidden>${ICO.alerta}<span>Ojo: hay clases sin video. Tus estudiantes verán "Daniela todavía no sube este video" en esas clases.</span></p>
      </section>

      <section class="paso paso-peligro">
        <h3>Eliminar el curso</h3>
        <p class="ayuda-chica">Si ya no quieres venderlo, es mejor ocultarlo (paso 5). Eliminar lo borra para siempre.</p>
        <button class="btn btn-borde btn-peligro-borde" type="button" id="borrar-curso">${ICO.basura} Eliminar este curso</button>
      </section>

      <div class="barra-guardar">
        <span id="estado-guardado">${ICO.ok} Todo guardado</span>
        <button class="btn btn-grande" type="submit">Guardar cambios</button>
      </div>
    </form>`);

  const f = zona.querySelector('#f-curso');
  marcarSucio(false);

  // Lee lo escrito en el formulario
  const leer = () => {
    c.titulo = f.titulo.value.trim() || 'Curso sin nombre';
    c.precio = soloDigitos(f.precio.value);
    c.resumen = f.resumen.value.trim();
    c.requisitos = f.requisitos.value.trim();
    c.publicado = f.publicado.checked;
    c.nivel = f.nivel.value || 'basico';
    f.querySelectorAll('[name=leccion]').forEach((i) => {
      const j = Number(i.dataset.j);
      c.lecciones[j].titulo = i.value.trim() || 'Clase ' + (j + 1);
    });
    return c;
  };
  // Guarda el curso tal como está en "c" (quien llama a guardar lee antes el formulario con leer()).
  const guardar = async (texto = 'Cambios guardados') => {
    if (c.precio < 1000) {
      await confirmar({ titulo: 'Revisa el precio', texto: 'El precio tiene que ser de al menos $1.000.', si: 'Entendido', soloAceptar: true });
      f.precio.focus();
      return false;
    }
    try {
      await nube.guardarCurso(c);
      marcarSucio(false);
      if (texto) avisar(texto);
      return true;
    } catch (e) {
      avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error');
      return false;
    }
  };
  // Guarda lo escrito y vuelve a dibujar el editor (después de agregar, mover o quitar)
  const guardarYRepintar = async (texto) => { if (await guardar(texto)) pintarEditor(c); };

  const avisoPublicar = () => {
    document.getElementById('aviso-publicar').hidden = !(f.publicado.checked && c.lecciones.some(l => !l.video));
  };
  avisoPublicar();

  f.addEventListener('input', (e) => {
    if (e.target.type === 'file') return;
    marcarSucio(true);
    if (e.target.name === 'titulo') document.getElementById('titulo-editor').textContent = e.target.value || 'Curso sin nombre';
  });
  f.publicado.addEventListener('change', avisoPublicar);
  f.precio.addEventListener('blur', () => { f.precio.value = precioTexto(soloDigitos(f.precio.value)); });
  f.addEventListener('submit', (e) => { e.preventDefault(); leer(); guardar(); });

  // Foto
  f.querySelectorAll('[data-foto]').forEach(b => b.onclick = () => {
    f.querySelectorAll('[data-foto]').forEach(x => x.setAttribute('aria-checked', x === b));
    c.imagen = b.dataset.foto;
    marcarSucio(true);
  });
  document.getElementById('subir-foto').onchange = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    if (archivo.size > 8 * 1024 * 1024) {
      await confirmar({ titulo: 'La foto es muy pesada', texto: `Pesa ${mb(archivo.size)} y el máximo es 8 MB. Prueba con otra foto o envíatela por WhatsApp a ti misma para que se achique.`, si: 'Entendido', soloAceptar: true });
      return;
    }
    avisar('Subiendo la foto…');
    try {
      const ruta = await nube.subirArchivo(`portadas/${nombreArchivo(archivo)}`, archivo);
      leer();
      c.imagen = await nube.urlPublica(ruta);
      await guardarYRepintar('Foto subida y guardada');
    } catch (x) { avisar('No se pudo subir la foto. Intenta de nuevo.', 'error'); }
  };

  // Clases (no se reordenan mientras sube un video, para que no termine en otra clase)
  const esperarSubida = async () => {
    if (!subiendo) return false;
    await confirmar({ titulo: 'Espera un momento', texto: 'Hay un archivo subiéndose. Cuando termine, podrás agregar, mover o quitar clases.', si: 'Entendido', soloAceptar: true });
    return true;
  };
  document.getElementById('agregar-clase').onclick = async () => {
    if (await esperarSubida()) return;
    leer();
    c.lecciones.push({ titulo: 'Clase ' + (c.lecciones.length + 1), duracion: '' });
    guardarYRepintar('Clase agregada');
  };
  const mover = async (j, k) => { if (await esperarSubida()) return; leer(); [c.lecciones[j], c.lecciones[k]] = [c.lecciones[k], c.lecciones[j]]; guardarYRepintar('Orden guardado'); };
  f.querySelectorAll('[data-subir-clase]').forEach(b => b.onclick = () => mover(Number(b.dataset.subirClase), Number(b.dataset.subirClase) - 1));
  f.querySelectorAll('[data-bajar-clase]').forEach(b => b.onclick = () => mover(Number(b.dataset.bajarClase), Number(b.dataset.bajarClase) + 1));
  f.querySelectorAll('[data-quitar-clase]').forEach(b => b.onclick = async () => {
    const j = Number(b.dataset.quitarClase);
    if (await esperarSubida()) return;
    leer();
    if (c.lecciones.length === 1) {
      await confirmar({ titulo: 'No se puede quitar', texto: 'Un curso necesita al menos una clase.', si: 'Entendido', soloAceptar: true });
      return;
    }
    const l = c.lecciones[j];
    const ok = await confirmar({
      titulo: `¿Quitar la clase ${j + 1}?`,
      texto: `Vas a quitar <b>"${esc(l.titulo)}"</b>${l.video ? ' y su video' : ''}. Esto no se puede deshacer.`,
      si: 'Sí, quitar la clase', no: 'No, dejarla', peligro: true
    });
    if (!ok) return;
    c.lecciones.splice(j, 1);
    if (await guardar('Clase quitada')) {
      if (l.video) nube.borrarArchivo(l.video);
      pintarEditor(c);
    }
  });

  // Subir videos
  f.querySelectorAll('[data-video]').forEach(inp => inp.onchange = async () => {
    const archivo = inp.files[0];
    inp.value = '';
    if (!archivo) return;
    if (!/\.(mp4|m4v|mov|webm)$/i.test(archivo.name)) {
      await confirmar({ titulo: 'Ese video no sirve', texto: 'Ese formato no se ve en todos los celulares. Sube el video en <b>MP4</b>, que es como lo graba el celular.', si: 'Entendido', soloAceptar: true });
      return;
    }
    // Aviso si el video es muy pesado: cada vez que alguien lo ve se gasta de la parte gratis.
    const segundos = await segundosVideo(archivo);
    const porMinuto = segundos ? archivo.size / 1e6 / (segundos / 60) : 0;
    if (segundos ? porMinuto > MB_POR_MINUTO_MAX : archivo.size / 1e6 > MB_SIN_DURACION_MAX) {
      const seguir = await confirmar({
        titulo: 'Este video es muy pesado',
        texto: `Pesa <b>${mb(archivo.size)}</b>${segundos ? ` (${textoDuracion(segundos)}, unos ${Math.round(porMinuto)} MB por minuto)` : ''}. Parece grabado en Full HD o 4K.<br><br>
          Para que tu página siga siendo gratis, es mejor grabar en <b>720p</b>: se ve igual de bien en el celular y pesa varias veces menos.
          Se cambia en la cámara del celular, en Ajustes → Grabar video o Resolución.`,
        si: 'Subirlo igual', no: 'No, elegiré otro'
      });
      if (!seguir) return;
    }
    const j = Number(inp.dataset.video);
    const fila = f.querySelector(`.clase[data-j="${j}"]`);
    const caja = fila.querySelector('.subida');
    const barra = caja.querySelector('.progreso span');
    const texto = caja.querySelector('p');
    fila.querySelector('.clase-video').hidden = true;
    caja.hidden = false;
    subiendo++;
    try {
      const ruta = await nube.subirArchivo(`cursos/${c.id}/videos/${nombreArchivo(archivo)}`, archivo, (p) => {
        barra.style.width = p + '%';
        texto.innerHTML = `<b>Subiendo video… ${p}%</b> (${mb(archivo.size)})<br>No cierres esta página hasta que termine.`;
      });
      leer();
      const anterior = c.lecciones[j].video;
      c.lecciones[j] = { ...c.lecciones[j], video: ruta, duracion: textoDuracion(segundos), megas: Math.round(archivo.size / 1e6) };
      subiendo--;
      if (await guardar(`Video de la clase ${j + 1} subido y guardado`)) {
        if (anterior) nube.borrarArchivo(anterior);
        pintarEditor(c);
      }
    } catch (e) {
      subiendo = Math.max(0, subiendo - 1);
      caja.hidden = true;
      fila.querySelector('.clase-video').hidden = false;
      avisar('No se pudo subir el video. Revisa tu internet y vuelve a intentarlo.', 'error');
    }
  });

  // Materiales
  document.getElementById('subir-material').onchange = async (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    const caja = document.getElementById('subida-material');
    const barra = caja.querySelector('.progreso span');
    caja.hidden = false;
    subiendo++;
    try {
      const ruta = await nube.subirArchivo(`cursos/${c.id}/materiales/${nombreArchivo(archivo)}`, archivo, (p) => {
        barra.style.width = p + '%';
        caja.querySelector('p').textContent = `Subiendo… ${p}%`;
      });
      subiendo--;
      leer();
      c.materiales = [...c.materiales, { nombre: archivo.name.replace(/\.[^.]+$/, ''), ruta }];
      await guardarYRepintar('Material subido y guardado');
    } catch (x) {
      subiendo = Math.max(0, subiendo - 1);
      caja.hidden = true;
      avisar('No se pudo subir el material. Intenta de nuevo.', 'error');
    }
  };
  f.querySelectorAll('[data-quitar-material]').forEach(b => b.onclick = async () => {
    const k = Number(b.dataset.quitarMaterial);
    const m = c.materiales[k];
    if (!await confirmar({ titulo: '¿Quitar este material?', texto: `Vas a quitar <b>"${esc(m.nombre)}"</b>. Tus estudiantes ya no podrán descargarlo.`, si: 'Sí, quitarlo', no: 'No', peligro: true })) return;
    leer();
    c.materiales.splice(k, 1);
    if (await guardar('Material quitado')) { nube.borrarArchivo(m.ruta); pintarEditor(c); }
  });

  // Eliminar curso
  document.getElementById('borrar-curso').onclick = async () => {
    if (await nube.tieneVentas(c.id)) {
      await confirmar({ titulo: 'Este curso ya tiene estudiantes', texto: 'Como ya lo compraron, no se puede eliminar: perderían su acceso. Si no quieres venderlo más, apaga "Mostrar este curso en mi página" (paso 5).', si: 'Entendido', soloAceptar: true });
      return;
    }
    const ok = await confirmar({ titulo: '¿Eliminar este curso?', texto: `Se borrará <b>"${esc(c.titulo)}"</b> para siempre, con sus clases. Esto no se puede deshacer.`, si: 'Sí, eliminar para siempre', no: 'No, conservarlo', peligro: true });
    if (!ok) return;
    try {
      await nube.borrarCurso(c.id);
      marcarSucio(false);
      avisar('Curso eliminado');
      location.hash = 'cursos';
    } catch (x) { avisar('No se pudo eliminar. Intenta de nuevo.', 'error'); }
  };
}

// ---------- Fotos de clases presenciales y talleres ----------
const fotoUrl = (f) => NMC.foto(f);
// Sube una foto pública (clases presenciales y talleres). Devuelve su dirección o null.
async function subirFotoPublica(archivo) {
  if (!/^image\//.test(archivo.type)) {
    await confirmar({ titulo: 'Eso no es una foto', texto: 'Elige una foto (JPG o PNG).', si: 'Entendido', soloAceptar: true });
    return null;
  }
  if (archivo.size > 8 * 1024 * 1024) {
    await confirmar({ titulo: 'La foto es muy pesada', texto: `Pesa ${mb(archivo.size)} y el máximo es 8 MB. Prueba con otra foto o envíatela por WhatsApp a ti misma para que se achique.`, si: 'Entendido', soloAceptar: true });
    return null;
  }
  const ruta = await nube.subirArchivo(`fotos/${nombreArchivo(archivo)}`, archivo);
  return nube.urlPublica(ruta);
}
// Borra de Storage una foto subida desde el panel (las fotos propias del sitio no se tocan)
const borrarFotoSubida = (f) => { if (/^https?:/.test(f || '')) nube.borrarArchivo(f); };
// Después de guardar, las páginas vuelven a leer lo nuevo
const limpiarCache = () => { try { sessionStorage.removeItem('nm_presenciales'); sessionStorage.removeItem('nm_talleres'); } catch (x) {} };
const copia = (x) => JSON.parse(JSON.stringify(x));

// ---------- Clases presenciales ----------
const listaPresenciales = async () => (await nube.contenido('presenciales')) || copia(NMC.PRESENCIALES);
const guardarPresenciales = async (lista) => { await nube.guardarContenido('presenciales', lista); limpiarCache(); };

async function presenciales() {
  cargando('presenciales');
  const lista = await listaPresenciales();
  marco('presenciales', `
    <div class="panel-barra">
      <h2 class="panel-titulo">Mis clases presenciales</h2>
      <button class="btn" type="button" id="nueva-clase">${ICO.mas} Agregar una clase</button>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>Son las clases que se ven en <b>Cursos</b> y en la página de inicio: en tu taller, a domicilio u online en vivo. Haz clic en una para cambiar su precio, horarios, textos o fotos. Con las flechas cambias el orden en que aparecen.</span></p>
    <ul class="lista-cursos lista-orden">${lista.map((c, k) => `<li>
      <a class="curso-fila" href="#presencial/${encodeURIComponent(c.id)}">
        <img src="${esc(fotoUrl(c.imagen))}" alt="">
        <div>
          <b>${esc(c.titulo)}</b>
          <span class="curso-datos">${c.precio ? clp(c.precio) + (c.unidad ? ' por ' + esc(c.unidad) : '') : 'Precio a convenir'}${c.modalidad ? ' · ' + esc(c.modalidad) : ''}</span>
          ${c.visible !== false ? `<span class="estado estado-ok">${ICO.ok} En tu página</span>` : '<span class="estado">Oculta (no se muestra)</span>'}
        </div>
        <span class="btn btn-borde btn-chico">Abrir</span>
      </a>
      <div class="clase-mover">
        <button type="button" class="icono" data-subir="${k}" ${k === 0 ? 'disabled' : ''} aria-label="Mover ${esc(c.titulo)} hacia arriba">${ICO.arriba}</button>
        <button type="button" class="icono" data-bajar="${k}" ${k === lista.length - 1 ? 'disabled' : ''} aria-label="Mover ${esc(c.titulo)} hacia abajo">${ICO.abajo}</button>
      </div>
    </li>`).join('')}</ul>`);

  const mover = async (j, k) => {
    [lista[j], lista[k]] = [lista[k], lista[j]];
    try { await guardarPresenciales(lista); avisar('Orden guardado'); presenciales(); }
    catch (x) { avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error'); }
  };
  document.querySelectorAll('[data-subir]').forEach(b => b.onclick = () => mover(Number(b.dataset.subir), Number(b.dataset.subir) - 1));
  document.querySelectorAll('[data-bajar]').forEach(b => b.onclick = () => mover(Number(b.dataset.bajar), Number(b.dataset.bajar) + 1));
  document.getElementById('nueva-clase').onclick = async () => {
    const id = 'clase-' + Date.now().toString(36);
    lista.push({ id, visible: false, titulo: 'Mi clase nueva', modalidad: 'En el taller · La Reina', bajada: '', resumen: '', imagen: 'cursos-02.jpg', fotos: [],
      descripcion: '', puntosTitulo: '', puntos: '', precio: 0, unidad: 'módulo', duracion: '', datos: 'Dónde: \nHorarios: ',
      inscripcion: 'Para tomar este curso debes pagar el total previamente y coordinar el horario de preferencia por WhatsApp o correo electrónico.',
      whatsapp: 'Hola Daniela, quiero información sobre tus clases.', recuadros: [] });
    try {
      await guardarPresenciales(lista);
      avisar('Clase creada. Ahora complétala.');
      location.hash = 'presencial/' + id;
    } catch (x) { avisar('No se pudo crear. Revisa tu internet y vuelve a intentarlo.', 'error'); }
  };
}

async function editarPresencial(id) {
  cargando('presenciales');
  const lista = await listaPresenciales();
  const c = lista.find(x => x.id === id);
  if (!c) {
    marco('presenciales', '<div class="vacio"><p>Esta clase ya no existe.</p><a class="btn" href="#presenciales">Volver a mis clases</a></div>');
    return;
  }
  c.fotos = c.fotos || [];
  c.recuadros = c.recuadros || [];
  pintarPresencial(lista, c);
}

function pintarPresencial(lista, c) {
  const campo = (nombre, etiqueta, ayuda = '', extra = '') => `<label>${etiqueta}
    <input name="${nombre}" value="${esc(c[nombre] || '')}" maxlength="300" ${extra}>${ayuda ? `<small>${ayuda}</small>` : ''}</label>`;
  const area = (nombre, etiqueta, ayuda = '', filas = 4, valor = c[nombre]) => `<label>${etiqueta}
    <textarea name="${nombre}" rows="${filas}" maxlength="3000">${esc(valor || '')}</textarea>${ayuda ? `<small>${ayuda}</small>` : ''}</label>`;
  const NEGRITA = 'Lo que pongas entre *asteriscos* sale en <b>negrita</b>.';

  const zona = marco('presenciales', `
    <a class="volver" href="#presenciales">${ICO.volver} Volver a mis clases</a>
    <div class="panel-barra">
      <h2 class="panel-titulo" id="titulo-editor">${esc(c.titulo)}</h2>
      <a class="btn btn-borde btn-chico" href="${esc(NMC.enlace(c))}" target="_blank" rel="noopener">${ICO.ojo} Ver cómo se ve</a>
    </div>

    <form id="f-presencial" class="editor" novalidate>
      <section class="paso">
        <h3><span class="num">1</span> Datos de la clase</h3>
        ${campo('titulo', 'Nombre de la clase', '', 'maxlength="120" required')}
        ${campo('modalidad', 'Dónde o cómo es', 'Una etiqueta corta. Ej: "En el taller · La Reina", "A domicilio" u "Online en vivo".')}
        <label>Precio
          <span class="campo-precio"><span>$</span><input name="precio" inputmode="numeric" value="${c.precio ? precioTexto(c.precio) : ''}"></span>
          <small>En pesos chilenos. Con precio, aparece el botón <b>Pagar e inscribirme</b> y te pagan con Mercado Pago. Si lo dejas vacío, dice "A convenir" y solo se pueden inscribir por WhatsApp.</small></label>
        ${campo('unidad', 'El precio es por…', 'Ej: módulo, clase o mes.')}
        ${campo('duracion', 'Duración', 'Ej: 4 clases de 2 horas · máx. 3 personas.')}
      </section>

      <section class="paso">
        <h3><span class="num">2</span> Textos</h3>
        ${area('resumen', 'Texto corto para la tarjeta', 'Se ve en la página de Cursos y en el inicio. 2 o 3 líneas.', 3)}
        ${campo('bajada', 'Frase bajo el título', 'Va en la parte de arriba de la página de la clase.')}
        ${area('descripcion', 'Descripción', 'Deja una línea en blanco para separar párrafos. ' + NEGRITA, 6)}
        ${campo('puntosTitulo', 'Título de la lista (opcional)', 'Ej: Contenidos. Si lo dejas vacío, la lista va sin título.')}
        ${area('puntos', 'Lista de detalles', 'Un detalle por línea: qué incluye, cupos, condiciones… ' + NEGRITA, 7)}
      </section>

      <section class="paso">
        <h3><span class="num">3</span> Inscripción</h3>
        ${area('datos', 'Dónde y cuándo', 'Uno por línea. Lo que va antes de los dos puntos sale en negrita. Ej: "Horarios: a convenir".', 3)}
        ${area('inscripcion', '¿Cómo inscribirse?', '', 3)}
        ${campo('whatsapp', 'Mensaje de WhatsApp', 'El mensaje que te llega escrito cuando alguien toca el botón de WhatsApp de esta clase.')}
      </section>

      <section class="paso">
        <h3><span class="num">4</span> Foto de la tarjeta</h3>
        <p class="ayuda-chica">Toca la foto que quieras usar, o sube una tuya.</p>
        <div class="fotos-elegir" role="radiogroup" aria-label="Foto de la tarjeta">
          ${/^https?:/.test(c.imagen) ? `<button type="button" role="radio" aria-checked="true" data-foto="${esc(c.imagen)}"><img src="${esc(c.imagen)}" alt="Tu foto"></button>` : ''}
          ${FOTOS.map(f => `<button type="button" role="radio" aria-checked="${c.imagen === f + '.jpg'}" data-foto="${f}.jpg"><img src="assets/img/${f}.jpg" alt="" loading="lazy"></button>`).join('')}
        </div>
        <label class="btn btn-borde subir-archivo">${ICO.foto} Subir una foto mía<input type="file" accept="image/*" id="subir-portada" hidden></label>
      </section>

      <section class="paso">
        <h3><span class="num">5</span> Fotos de la página <span class="contador">${c.fotos.length} ${c.fotos.length === 1 ? 'foto' : 'fotos'}</span></h3>
        <p class="ayuda-chica">Las 3 primeras van arriba de la descripción; las demás, en una galería al final de la página. Puedes subir varias a la vez. Es opcional.</p>
        ${c.fotos.length ? `<ul class="fotos-lista">${c.fotos.map((f, k) => `<li><img src="${esc(fotoUrl(f))}" alt="Foto ${k + 1}">
          <button type="button" class="icono peligro" data-quitar-foto="${k}" aria-label="Quitar la foto ${k + 1}">${ICO.basura}</button></li>`).join('')}</ul>` : ''}
        <label class="btn btn-borde subir-archivo">${ICO.foto} Subir fotos<input type="file" accept="image/*" multiple id="subir-fotos" hidden></label>
        <div class="subida" id="subida-fotos" hidden><div class="progreso"><span></span></div><p></p></div>
      </section>

      <section class="paso">
        <h3><span class="num">6</span> Recuadros al final (opcional)</h3>
        <p class="ayuda-chica">Para información extra, como "¿Qué materiales necesitas?". Van debajo de todo, cada uno con su foto.</p>
        ${c.recuadros.length ? `<ol class="clases">${c.recuadros.map((r, k) => `<li class="clase recuadro" data-k="${k}">
          <div class="clase-cabeza">
            <span class="clase-num">Recuadro ${k + 1}</span>
            <div class="clase-mover"><button type="button" class="icono peligro" data-quitar-recuadro="${k}" aria-label="Quitar el recuadro ${k + 1}">${ICO.basura}</button></div>
          </div>
          <label>Título<input name="r-titulo" data-k="${k}" value="${esc(r.titulo)}" maxlength="150"></label>
          <label>Texto<textarea name="r-texto" data-k="${k}" rows="3" maxlength="1500">${esc(r.texto)}</textarea></label>
          <div class="recuadro-foto">
            ${r.imagen ? `<img src="${esc(fotoUrl(r.imagen))}" alt="">` : '<span class="estado">Sin foto</span>'}
            <label class="btn btn-borde btn-chico">${ICO.foto} ${r.imagen ? 'Cambiar foto' : 'Subir foto'}<input type="file" accept="image/*" data-foto-recuadro="${k}" hidden></label>
          </div>
        </li>`).join('')}</ol>` : ''}
        <button class="btn btn-borde" type="button" id="agregar-recuadro">${ICO.mas} Agregar un recuadro</button>
      </section>

      <section class="paso">
        <h3><span class="num">7</span> ¿Mostrarla en tu página?</h3>
        <label class="interruptor">
          <input type="checkbox" name="visible" ${c.visible !== false ? 'checked' : ''}>
          <span class="pista" aria-hidden="true"></span>
          <span><b>Mostrar esta clase en mi página</b><br><small>Si está apagado, la clase no aparece en Cursos, en el inicio ni en el menú.</small></span>
        </label>
      </section>

      ${c.pagina ? '' : `<section class="paso paso-peligro">
        <h3>Eliminar la clase</h3>
        <p class="ayuda-chica">Si solo quieres dejar de mostrarla por un tiempo, es mejor ocultarla (paso 7). Eliminar la borra para siempre.</p>
        <button class="btn btn-borde btn-peligro-borde" type="button" id="borrar-clase">${ICO.basura} Eliminar esta clase</button>
      </section>`}

      <div class="barra-guardar">
        <span id="estado-guardado">${ICO.ok} Todo guardado</span>
        <button class="btn btn-grande" type="submit">Guardar cambios</button>
      </div>
    </form>`);

  const f = zona.querySelector('#f-presencial');
  marcarSucio(false);

  const leer = () => {
    ['modalidad', 'unidad', 'duracion', 'resumen', 'bajada', 'descripcion', 'puntosTitulo', 'puntos', 'datos', 'inscripcion', 'whatsapp']
      .forEach(k => { c[k] = f[k].value.trim(); });
    c.titulo = f.titulo.value.trim() || 'Clase sin nombre';
    c.precio = soloDigitos(f.precio.value);
    c.visible = f.visible.checked;
    f.querySelectorAll('[name=r-titulo]').forEach(i => { c.recuadros[i.dataset.k].titulo = i.value.trim(); });
    f.querySelectorAll('[name=r-texto]').forEach(i => { c.recuadros[i.dataset.k].texto = i.value.trim(); });
  };
  const guardar = async (texto = 'Cambios guardados. Ya se ven en tu página.') => {
    try {
      await guardarPresenciales(lista);
      marcarSucio(false);
      if (texto) avisar(texto);
      return true;
    } catch (x) {
      avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error');
      return false;
    }
  };
  const guardarYRepintar = async (texto) => { if (await guardar(texto)) pintarPresencial(lista, c); };

  f.addEventListener('input', (e) => {
    if (e.target.type === 'file') return;
    marcarSucio(true);
    if (e.target.name === 'titulo') document.getElementById('titulo-editor').textContent = e.target.value || 'Clase sin nombre';
  });
  f.precio.addEventListener('blur', () => { const n = soloDigitos(f.precio.value); f.precio.value = n ? precioTexto(n) : ''; });
  f.addEventListener('submit', (e) => { e.preventDefault(); leer(); guardar(); });

  // Sube una foto y, si sale bien, la guarda con lo que esté escrito
  const conFoto = async (input, alSubir, texto) => {
    const archivo = input.files[0];
    input.value = '';
    if (!archivo || await esperarSubidaFoto()) return;
    avisar('Subiendo la foto…');
    subiendo++;
    try {
      const url = await subirFotoPublica(archivo);
      subiendo--;
      if (!url) return;
      leer();
      alSubir(url);
      await guardarYRepintar(texto);
    } catch (x) {
      subiendo = Math.max(0, subiendo - 1);
      avisar('No se pudo subir la foto. Intenta de nuevo.', 'error');
    }
  };

  // Foto de la tarjeta
  f.querySelectorAll('[data-foto]').forEach(b => b.onclick = () => {
    f.querySelectorAll('[data-foto]').forEach(x => x.setAttribute('aria-checked', x === b));
    c.imagen = b.dataset.foto;
    marcarSucio(true);
  });
  document.getElementById('subir-portada').onchange = (e) => conFoto(e.target, (url) => { c.imagen = url; }, 'Foto subida y guardada');

  // Fotos de la página
  // Varias fotos a la vez, una tras otra, con su avance
  document.getElementById('subir-fotos').onchange = async (e) => {
    const archivos = [...e.target.files];
    e.target.value = '';
    if (!archivos.length || await esperarSubidaFoto()) return;
    const caja = document.getElementById('subida-fotos');
    const barra = caja.querySelector('.progreso span');
    caja.hidden = false;
    subiendo++;
    const nuevas = [];
    try {
      for (const [n, archivo] of archivos.entries()) {
        caja.querySelector('p').innerHTML = `<b>Subiendo foto ${n + 1} de ${archivos.length}…</b> No cierres esta página hasta que termine.`;
        barra.style.width = Math.round(100 * n / archivos.length) + '%';
        const url = await subirFotoPublica(archivo);
        if (url) nuevas.push(url);
      }
    } catch (x) {
      avisar('No se pudieron subir todas las fotos. Revisa tu internet y vuelve a intentarlo.', 'error');
    }
    subiendo = Math.max(0, subiendo - 1);
    caja.hidden = true;
    if (!nuevas.length) return;
    leer();
    c.fotos.push(...nuevas);
    await guardarYRepintar(nuevas.length === 1 ? 'Foto subida y guardada' : `${nuevas.length} fotos subidas y guardadas`);
  };
  f.querySelectorAll('[data-quitar-foto]').forEach(b => b.onclick = async () => {
    const k = Number(b.dataset.quitarFoto);
    if (!await confirmar({ titulo: '¿Quitar esta foto?', texto: 'La foto deja de verse en la página de la clase.', si: 'Sí, quitarla', no: 'No', peligro: true })) return;
    leer();
    const [quitada] = c.fotos.splice(k, 1);
    if (await guardar('Foto quitada')) { borrarFotoSubida(quitada); pintarPresencial(lista, c); }
  });

  // Recuadros
  document.getElementById('agregar-recuadro').onclick = () => {
    leer();
    c.recuadros.push({ titulo: '', texto: '', imagen: '' });
    guardarYRepintar('Recuadro agregado. Escribe su título y su texto.');
  };
  f.querySelectorAll('[data-quitar-recuadro]').forEach(b => b.onclick = async () => {
    const k = Number(b.dataset.quitarRecuadro);
    leer();
    const r = c.recuadros[k];
    if (!await confirmar({ titulo: `¿Quitar el recuadro ${k + 1}?`, texto: `Vas a quitar ${r.titulo ? `<b>"${esc(r.titulo)}"</b>` : 'este recuadro'}. Esto no se puede deshacer.`, si: 'Sí, quitarlo', no: 'No', peligro: true })) return;
    c.recuadros.splice(k, 1);
    if (await guardar('Recuadro quitado')) { borrarFotoSubida(r.imagen); pintarPresencial(lista, c); }
  });
  f.querySelectorAll('[data-foto-recuadro]').forEach(inp => inp.onchange = () => {
    const k = Number(inp.dataset.fotoRecuadro);
    const anterior = c.recuadros[k].imagen;
    conFoto(inp, (url) => { c.recuadros[k].imagen = url; borrarFotoSubida(anterior); }, 'Foto subida y guardada');
  });

  // Eliminar (solo las clases agregadas desde el panel; las originales tienen su propia página)
  document.getElementById('borrar-clase')?.addEventListener('click', async () => {
    const ok = await confirmar({ titulo: '¿Eliminar esta clase?', texto: `Se borrará <b>"${esc(c.titulo)}"</b> para siempre. Esto no se puede deshacer.`, si: 'Sí, eliminar para siempre', no: 'No, conservarla', peligro: true });
    if (!ok) return;
    const resto = lista.filter(x => x !== c);
    try {
      await guardarPresenciales(resto);
      [c.imagen, ...c.fotos, ...c.recuadros.map(r => r.imagen)].forEach(borrarFotoSubida);
      marcarSucio(false);
      avisar('Clase eliminada');
      location.hash = 'presenciales';
    } catch (x) { avisar('No se pudo eliminar. Intenta de nuevo.', 'error'); }
  });
}

const esperarSubidaFoto = async () => {
  if (!subiendo) return false;
  await confirmar({ titulo: 'Espera un momento', texto: 'Todavía se está subiendo una foto. Cuando termine, podrás subir otra.', si: 'Entendido', soloAceptar: true });
  return true;
};

// ---------- Talleres realizados ----------
const listaTalleres = async () => (await nube.contenido('talleres')) || copia(NMC.TALLERES);

async function talleres() {
  cargando('talleres');
  pintarTalleres(await listaTalleres());
}

function pintarTalleres(lista) {
  const zona = marco('talleres', `
    <div class="panel-barra">
      <h2 class="panel-titulo">Talleres realizados</h2>
      <a class="btn btn-borde btn-chico" href="talleres" target="_blank" rel="noopener">${ICO.ojo} Ver cómo se ve</a>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>Cada taller tiene sus años, su nombre, un texto y sus fotos. Aparecen en tu página en este mismo orden; usa las flechas para cambiarlo. Las fotos se guardan solas apenas terminan de subir.</span></p>

    <form id="f-talleres" class="editor" novalidate>
      ${lista.map((t, k) => `<section class="paso taller" data-k="${k}">
        <div class="clase-cabeza">
          <h3>Taller ${k + 1}</h3>
          <div class="clase-mover">
            <button type="button" class="icono" data-subir-taller="${k}" ${k === 0 ? 'disabled' : ''} aria-label="Mover el taller ${k + 1} hacia arriba">${ICO.arriba}</button>
            <button type="button" class="icono" data-bajar-taller="${k}" ${k === lista.length - 1 ? 'disabled' : ''} aria-label="Mover el taller ${k + 1} hacia abajo">${ICO.abajo}</button>
            <button type="button" class="icono peligro" data-quitar-taller="${k}" aria-label="Quitar el taller ${k + 1}">${ICO.basura}</button>
          </div>
        </div>
        <label>Años<input name="anios" data-k="${k}" value="${esc(t.anios)}" maxlength="40" placeholder="Ej: 2025 - 2026"></label>
        <label>Nombre del taller<input name="titulo" data-k="${k}" value="${esc(t.titulo)}" maxlength="200"></label>
        <label>Texto<textarea name="texto" data-k="${k}" rows="4" maxlength="2000">${esc(t.texto)}</textarea>
          <small>Qué hicieron, con quién y dónde. Lo que pongas entre *asteriscos* sale en <b>negrita</b>.</small></label>
        <div>
          <p class="etiqueta-campo">Fotos <span class="contador">${(t.fotos || []).length}</span></p>
          ${(t.fotos || []).length ? `<ul class="fotos-lista">${t.fotos.map((f, j) => `<li><img src="${esc(fotoUrl(f))}" alt="Foto ${j + 1}" loading="lazy">
            <button type="button" class="icono peligro" data-quitar-foto="${k}/${j}" aria-label="Quitar la foto ${j + 1}">${ICO.basura}</button></li>`).join('')}</ul>` : ''}
          <label class="btn btn-borde subir-archivo">${ICO.foto} Subir fotos<input type="file" accept="image/*" multiple data-subir-fotos="${k}" hidden></label>
          <div class="subida" hidden><div class="progreso"><span></span></div><p></p></div>
        </div>
      </section>`).join('')}

      <button class="btn btn-borde" type="button" id="agregar-taller">${ICO.mas} Agregar un taller</button>

      <div class="barra-guardar">
        <span id="estado-guardado">${ICO.ok} Todo guardado</span>
        <button class="btn btn-grande" type="submit">Guardar cambios</button>
      </div>
    </form>`);

  const f = zona.querySelector('#f-talleres');
  marcarSucio(false);

  const leer = () => {
    ['anios', 'titulo', 'texto'].forEach(campo => f.querySelectorAll(`[name=${campo}]`).forEach(i => { lista[i.dataset.k][campo] = i.value.trim(); }));
    lista.forEach(t => { t.titulo = t.titulo || 'Taller sin nombre'; t.fotos = t.fotos || []; });
  };
  const guardar = async (texto = 'Cambios guardados. Ya se ven en tu página.') => {
    try {
      await nube.guardarContenido('talleres', lista);
      limpiarCache();
      marcarSucio(false);
      if (texto) avisar(texto);
      return true;
    } catch (x) {
      avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error');
      return false;
    }
  };
  const guardarYRepintar = async (texto) => { if (await guardar(texto)) pintarTalleres(lista); };

  f.addEventListener('input', (e) => { if (e.target.type !== 'file') marcarSucio(true); });
  f.addEventListener('submit', (e) => { e.preventDefault(); leer(); guardar(); });

  document.getElementById('agregar-taller').onclick = async () => {
    if (await esperarSubidaFoto()) return;
    leer();
    lista.unshift({ anios: String(new Date().getFullYear()), titulo: 'Mi taller nuevo', texto: '', fotos: [] });
    await guardarYRepintar('Taller agregado arriba de todo. Completa sus datos y sube sus fotos.');
  };
  const mover = async (j, k) => { if (await esperarSubidaFoto()) return; leer(); [lista[j], lista[k]] = [lista[k], lista[j]]; guardarYRepintar('Orden guardado'); };
  f.querySelectorAll('[data-subir-taller]').forEach(b => b.onclick = () => mover(Number(b.dataset.subirTaller), Number(b.dataset.subirTaller) - 1));
  f.querySelectorAll('[data-bajar-taller]').forEach(b => b.onclick = () => mover(Number(b.dataset.bajarTaller), Number(b.dataset.bajarTaller) + 1));
  f.querySelectorAll('[data-quitar-taller]').forEach(b => b.onclick = async () => {
    if (await esperarSubidaFoto()) return;
    leer();
    const k = Number(b.dataset.quitarTaller);
    const t = lista[k];
    const ok = await confirmar({ titulo: `¿Quitar el taller ${k + 1}?`, texto: `Vas a quitar <b>"${esc(t.titulo)}"</b> y sus fotos de tu página. Esto no se puede deshacer.`, si: 'Sí, quitar el taller', no: 'No, dejarlo', peligro: true });
    if (!ok) return;
    lista.splice(k, 1);
    if (await guardar('Taller quitado')) { t.fotos.forEach(borrarFotoSubida); pintarTalleres(lista); }
  });
  f.querySelectorAll('[data-quitar-foto]').forEach(b => b.onclick = async () => {
    if (await esperarSubidaFoto()) return;
    const [k, j] = b.dataset.quitarFoto.split('/').map(Number);
    if (!await confirmar({ titulo: '¿Quitar esta foto?', texto: 'La foto deja de verse en tu página.', si: 'Sí, quitarla', no: 'No', peligro: true })) return;
    leer();
    const [quitada] = lista[k].fotos.splice(j, 1);
    if (await guardar('Foto quitada')) { borrarFotoSubida(quitada); pintarTalleres(lista); }
  });

  // Varias fotos a la vez, una tras otra, con su avance
  f.querySelectorAll('[data-subir-fotos]').forEach(inp => inp.onchange = async () => {
    const archivos = [...inp.files];
    inp.value = '';
    if (!archivos.length || await esperarSubidaFoto()) return;
    const k = Number(inp.dataset.subirFotos);
    const caja = inp.closest('div').querySelector('.subida');
    const barra = caja.querySelector('.progreso span');
    caja.hidden = false;
    subiendo++;
    const nuevas = [];
    try {
      for (const [n, archivo] of archivos.entries()) {
        caja.querySelector('p').innerHTML = `<b>Subiendo foto ${n + 1} de ${archivos.length}…</b> No cierres esta página hasta que termine.`;
        barra.style.width = Math.round(100 * n / archivos.length) + '%';
        const url = await subirFotoPublica(archivo);
        if (url) nuevas.push(url);
      }
    } catch (x) {
      avisar('No se pudieron subir todas las fotos. Revisa tu internet y vuelve a intentarlo.', 'error');
    }
    subiendo = Math.max(0, subiendo - 1);
    caja.hidden = true;
    if (!nuevas.length) return;
    leer();
    lista[k].fotos.push(...nuevas);
    await guardarYRepintar(nuevas.length === 1 ? 'Foto subida y guardada' : `${nuevas.length} fotos subidas y guardadas`);
  });
}

// ---------- Mis páginas ----------
// Textos y fotos de cada página. En el HTML van marcados con data-texto (y data-tipo si no son
// texto simple); el valor original se lee de ese mismo HTML, así no se repite aquí.
// Cada campo: [clave, etiqueta, ayuda]. "galeria:<nombre>" es una galería de fotos del portafolio.
const NEGRITA = 'Lo que pongas entre *asteriscos* sale en <b>negrita</b>.';
const AYUDA_TIPO = {
  parrafos: 'Deja una línea en blanco para separar párrafos. ' + NEGRITA,
  lista: 'Uno por línea.',
  'linea-tiempo': 'Uno por línea: el año, dos puntos y lo que pasó. Ej: <b>2012: Creé mi marca Negra Mora.</b>'
};
const recuadroInicio = (n, lleva) => [`Recuadro ${n} (lleva a ${lleva})`, [
  [`inicio_s${n}Foto`, 'Foto'], [`inicio_s${n}Etiqueta`, 'Etiqueta chica'], [`inicio_s${n}Titulo`, 'Título'], [`inicio_s${n}Texto`, 'Texto']]];
const portafolio = (id, nombre, pagina) => ({
  id, nombre: 'Portafolio: ' + nombre, archivo: pagina, icono: ICO.foto,
  descripcion: 'Agregar, ordenar o quitar fotos, y cambiar el texto de arriba.',
  grupos: [
    ['Fotos', [['galeria:' + pagina, '']]],
    ['Arriba de la página', [[id + '_etiqueta', 'Etiqueta chica'], [id + '_titulo', 'Título'], [id + '_texto', 'Texto']]],
    ['Abajo', [[id + '_ctaTitulo', 'Frase final']]]
  ]
});

const PAGINAS = [
  { id: 'datos', nombre: 'Mis datos de contacto', icono: ICO.contacto, ver: 'contacto',
    descripcion: 'Correo, teléfono, Instagram, dirección y tu nombre. Cambian en todo el sitio.',
    grupos: [
      ['Tus datos de contacto', [
        ['correo', 'Tu correo', 'Cambia en todo el sitio: botones, pie de página y Contacto.'],
        ['telefono', 'Tu teléfono y WhatsApp', 'Con el +56. Todos los botones de WhatsApp del sitio te escriben a este número.'],
        ['instagram', 'Tu Instagram', 'Solo tu nombre de usuario, sin la @.'],
        ['direccion', 'Dónde está tu taller', 'Se ve en Contacto y en el pie de página.']
      ]],
      ['Tu nombre y tu descripción', [
        ['nombre', 'Tu nombre', 'En grande en la portada, arriba a la izquierda y en el pie.'],
        ['marca', 'Bajo tu nombre, arriba a la izquierda', ''],
        ['linea1', 'Lo que haces', 'La primera línea bajo tu nombre en la portada y en el pie.'],
        ['linea2', 'Segunda línea', '']
      ]]
    ] },
  { id: 'inicio', nombre: 'Inicio', archivo: './', icono: ICO.inicio,
    descripcion: 'La portada, las fotos, los recuadros y cada sección de la página principal.',
    grupos: [
      ['Portada', [['nombre', 'Tu nombre'], ['linea1', 'Lo que haces'], ['linea2', 'Segunda línea']]],
      ['Fotos bajo la portada', [['galeria:inicio-tira', '']]],
      ['Bienvenida', [['inicio_bienvenidaEtiqueta', 'Etiqueta chica'], ['inicio_bienvenidaTitulo', 'Título']]],
      recuadroInicio(1, 'Cursos'), recuadroInicio(2, 'Cursos online'), recuadroInicio(3, 'Portafolio'), recuadroInicio(4, 'Talleres realizados'),
      ['Quién soy (resumen)', [['inicio_qsFoto', 'Foto'], ['inicio_qsSaludo', 'Saludo'], ['inicio_qsTitulo', 'Título'], ['inicio_qsTexto', 'Texto']]],
      ['Cursos permanentes', [['inicio_cursosEtiqueta', 'Etiqueta chica'], ['cursosTitulo', 'Título'], ['cursosTexto', 'Texto bajo el título', 'Las tarjetas de abajo son tus clases: se cambian en <a href="#presenciales">Clases presenciales</a>.']]],
      ['Cursos online', [['inicio_onlineEtiqueta', 'Etiqueta chica'], ['onlineTitulo', 'Título', 'También es el título de la página Cursos online.'], ['onlineTexto', 'Texto bajo el título']]],
      ['Talleres en instituciones', [['inicio_instTitulo', 'Título'], ['inicio_instTexto', 'Texto'], ['inicio_instLista', 'Instituciones']]],
      ['Más fotos (opcional)', [['inicio_galeriaTitulo', 'Título de la sección', 'Si no subes fotos, esta sección no se muestra.'], ['galeria:inicio', '']]],
      ['Recuadro morado del final', [['inicio_ctaEtiqueta', 'Etiqueta chica'], ['inicio_ctaTitulo', 'Título'], ['inicio_ctaTexto', 'Texto']]]
    ] },
  { id: 'quien-soy', nombre: 'Quién soy', archivo: 'quien-soy', icono: ICO.persona,
    descripcion: 'Tu foto, tu presentación y la línea de tiempo de tu experiencia.',
    grupos: [
      ['Presentación', [['qs_foto', 'Foto'], ['qs_saludo', 'Saludo'], ['qs_titulo', 'Título'], ['qs_texto', 'Texto']]],
      ['Tu experiencia', [['qs_experienciaTitulo', 'Título'], ['qs_experiencia', 'Línea de tiempo']]],
      ['Más fotos (opcional)', [['qs_galeriaTitulo', 'Título de la sección', 'Si no subes fotos, esta sección no se muestra.'], ['galeria:quien-soy', '']]],
      ['Abajo', [['qs_ctaTitulo', 'Frase final']]]
    ] },
  { id: 'cursos', nombre: 'Cursos', archivo: 'cursos', icono: ICO.presencial,
    descripcion: 'El texto y la foto de arriba, y la tarjeta de los cursos en video.',
    grupos: [
      ['Arriba de la página', [['cursos_etiqueta', 'Etiqueta chica'], ['cursos_titulo', 'Título'], ['cursos_texto', 'Texto'], ['cursos_foto', 'Foto']]],
      ['Tarjeta de los cursos en video', [['cursos_videoFoto', 'Foto'], ['cursos_videoEtiqueta', 'Etiqueta chica'], ['cursos_videoTitulo', 'Título'],
        ['cursos_videoTexto', 'Texto', 'Va al final, después de tus clases. Las demás tarjetas se cambian en <a href="#presenciales">Clases presenciales</a>.']]],
      ['Más fotos (opcional)', [['cursos_galeriaTitulo', 'Título de la sección', 'Si no subes fotos, esta sección no se muestra.'], ['galeria:cursos', '']]]
    ] },
  { id: 'cursos-online', nombre: 'Cursos online', archivo: 'cursos-online', icono: ICO.cursos,
    descripcion: 'El texto de arriba y los 3 pasos de "¿Cómo funciona?".',
    grupos: [
      ['Arriba de la página', [['online_etiqueta', 'Etiqueta chica'], ['onlineTitulo', 'Título', 'También se ve en el inicio.'], ['onlineTexto', 'Texto']]],
      ['¿Cómo funciona?', [['online_pasosTitulo', 'Título'], ['online_paso1Titulo', 'Paso 1: título'], ['online_paso1Texto', 'Paso 1: texto'],
        ['online_paso2Titulo', 'Paso 2: título'], ['online_paso2Texto', 'Paso 2: texto'], ['online_paso3Titulo', 'Paso 3: título'], ['online_paso3Texto', 'Paso 3: texto']]]
    ] },
  { id: 'contacto', nombre: 'Contacto', archivo: 'contacto', icono: ICO.contacto,
    descripcion: 'El título y el texto de la página de contacto.',
    grupos: [
      ['Textos', [['contacto_etiqueta', 'Etiqueta chica'], ['contacto_titulo', 'Título'], ['contacto_texto', 'Texto', 'Tu correo, teléfono y dirección se cambian en <a href="#pagina/datos">Mis datos de contacto</a>.'], ['contacto_formTitulo', 'Título del formulario']]],
      ['Más fotos (opcional)', [['contacto_galeriaTitulo', 'Título de la sección', 'Si no subes fotos, esta sección no se muestra.'], ['galeria:contacto', '']]]
    ] },
  { id: 'patrones', nombre: 'Patrones', archivo: 'patrones', icono: ICO.pdf,
    descripcion: 'El texto de la página de patrones.',
    grupos: [
      ['Textos', [['patrones_etiqueta', 'Etiqueta chica'], ['patrones_titulo', 'Título'], ['patrones_texto', 'Texto'], ['patrones_ctaTitulo', 'Frase final']]],
      ['Más fotos (opcional)', [['patrones_galeriaTitulo', 'Título de la sección', 'Si no subes fotos, esta sección no se muestra.'], ['galeria:patrones', '']]]
    ] },
  { id: 'talleres', nombre: 'Talleres realizados (textos)', archivo: 'talleres', icono: ICO.talleres,
    descripcion: 'El texto de arriba de la página. Los talleres y sus fotos están en Talleres realizados.',
    grupos: [
      ['Textos', [['talleres_etiqueta', 'Etiqueta chica'], ['talleres_titulo', 'Título'], ['talleres_texto', 'Texto', 'Cada taller con sus fotos se cambia en <a href="#talleres">Talleres realizados</a>.'], ['talleres_ctaTitulo', 'Frase final']]]
    ] },
  portafolio('vestuario', 'Vestuario', 'vestuario'),
  portafolio('accesorios', 'Accesorios', 'accesorios'),
  portafolio('ilustracion', 'Ilustración textil', 'ilustracion-textil'),
  portafolio('arteterapia', 'Arte terapia', 'arte-terapia')
];

// Valores originales leídos del HTML de cada página: { clave: { tipo, valor } }
const htmlPaginas = {};
async function originales(archivo) {
  if (!archivo) return {};
  if (!htmlPaginas[archivo]) {
    const r = await fetch(archivo, { cache: 'no-cache' });
    if (!r.ok) throw new Error('No se pudo leer ' + archivo);
    htmlPaginas[archivo] = new DOMParser().parseFromString(await r.text(), 'text/html');
  }
  // Texto de un elemento con sus negritas entre *asteriscos*
  const aTexto = (el) => {
    if (!el) return '';
    const c = el.cloneNode(true);
    c.querySelectorAll('b, strong').forEach(b => b.replaceWith('*' + b.textContent.trim() + '*'));
    c.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
    return c.textContent.replace(/[ \t\r]*\n[ \t\r]*/g, '\n').replace(/[ \t\r]+/g, ' ').trim();
  };
  const LEER = {
    foto: (el) => (el.getAttribute('src') || '').replace(/^assets\/img\//, ''),
    parrafos: (el) => [...el.querySelectorAll('p')].map(aTexto).join('\n\n'),
    lista: (el) => [...el.children].map(aTexto).join('\n'),
    'linea-tiempo': (el) => [...el.children].map(li => {
      const b = li.querySelector('b');
      return (b ? b.textContent.trim() + ': ' : '') + aTexto(li.querySelector('span') || li);
    }).join('\n')
  };
  const res = {};
  htmlPaginas[archivo].querySelectorAll('[data-texto]').forEach(el => {
    const k = el.dataset.texto;
    if (k in res) return;
    const tipo = el.dataset.tipo || 'texto';
    res[k] = { tipo, valor: (LEER[tipo] || ((e) => e.textContent.replace(/\s+/g, ' ').trim()))(el) };
  });
  return res;
}

const limpiarCacheTextos = () => { try { sessionStorage.removeItem('nm_textos'); sessionStorage.removeItem('nm_galerias'); } catch (x) {} };

async function paginas() {
  cargando('paginas');
  marco('paginas', `
    <h2 class="panel-titulo">Mis páginas</h2>
    <p class="ayuda">${ICO.ayuda}<span>Elige qué quieres cambiar. En cada página puedes cambiar sus textos y sus fotos; en el portafolio, también agregar, ordenar y quitar fotos.</span></p>
    <div class="acciones">
      ${PAGINAS.map(p => `<a class="accion" href="#pagina/${p.id}">${p.icono || ICO.textos}<b>${esc(p.nombre)}</b><span>${esc(p.descripcion)}</span></a>`).join('')}
    </div>
    <h2 class="panel-titulo">También puedes cambiar</h2>
    <div class="acciones">
      <a class="accion" href="#presenciales">${ICO.presencial}<b>Clases presenciales</b><span>Cada clase con su página, precio, horarios y fotos.</span></a>
      <a class="accion" href="#talleres">${ICO.talleres}<b>Talleres realizados</b><span>Cada taller con sus años, su texto y sus fotos.</span></a>
      <a class="accion" href="#cursos">${ICO.cursos}<b>Cursos online</b><span>Tus cursos en video, sus precios y sus fotos.</span></a>
    </div>`);
}

async function editarPagina(id) {
  const pag = PAGINAS.find(p => p.id === id);
  if (!pag) { location.hash = 'paginas'; return; }
  cargando('paginas');
  const conGaleria = pag.grupos.some(([, campos]) => campos.some(([k]) => k.startsWith('galeria:')));
  const [guardados, orig, gals] = await Promise.all([nube.textos(), originales(pag.archivo), conGaleria ? nube.galerias() : {}]);
  pintarPagina(pag, guardados, orig, gals);
}

function pintarPagina(pag, guardados, orig, gals) {
  const original = (k) => NM.TEXTOS[k] ?? orig[k]?.valor ?? '';
  const tipo = (k) => orig[k]?.tipo || 'texto';
  const valor = (k) => guardados[k] || original(k);

  const campoFoto = (k, etiqueta) => `<div class="campo-fotos" data-campo-foto="${k}">
      <p class="etiqueta-campo">${esc(etiqueta)}</p>
      <div data-fotos-editar></div>
    </div>`;
  const campoTexto = (k, etiqueta, ayuda = '') => {
    const t = tipo(k);
    const v = valor(k);
    const ayudas = [ayuda, AYUDA_TIPO[t]].filter(Boolean).join(' ');
    const largo = t !== 'texto' || v.length > 90;
    const extra = k === 'correo' ? 'type="email" autocomplete="off"' : k === 'telefono' ? 'type="tel" inputmode="tel"' : '';
    return `<label>${esc(etiqueta)}
      ${largo ? `<textarea name="${k}" rows="${t === 'texto' ? 3 : Math.min(10, Math.max(4, v.split('\n').length + 1))}" maxlength="4000">${esc(v)}</textarea>`
        : `<input name="${k}" value="${esc(v)}" maxlength="300" ${extra}>`}
      ${ayudas ? `<small>${ayudas}</small>` : ''}</label>`;
  };
  const campo = ([k, etiqueta, ayuda]) => k.startsWith('galeria:') ? `<div data-galeria-editar="${k.slice(8)}"></div>`
    : tipo(k) === 'foto' ? campoFoto(k, etiqueta) : campoTexto(k, etiqueta, ayuda);
  const hayTextos = pag.grupos.some(([, campos]) => campos.some(([k]) => !k.startsWith('galeria:') && tipo(k) !== 'foto'));

  const zona = marco('paginas', `
    <a class="volver" href="#paginas">${ICO.volver} Volver a mis páginas</a>
    <div class="panel-barra">
      <h2 class="panel-titulo">${esc(pag.nombre)}</h2>
      <a class="btn btn-borde btn-chico" href="${esc(pag.ver || pag.archivo)}" target="_blank" rel="noopener">${ICO.ojo} Ver cómo se ve</a>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>Cambia lo que quieras y toca <b>Guardar cambios</b>. Si borras un texto, vuelve el original. Las fotos se guardan solas apenas terminan de subir.</span></p>
    <form id="f-pagina" class="editor" novalidate>
      ${pag.grupos.map(([titulo, campos]) => `<section class="paso">
        <h3>${esc(titulo)}</h3>
        ${campos.map(campo).join('')}
      </section>`).join('')}
      ${hayTextos ? `<div class="barra-guardar">
        <span id="estado-guardado">${ICO.ok} Todo guardado</span>
        <button class="btn btn-grande" type="submit">Guardar cambios</button>
      </div>` : ''}
    </form>`);

  const f = zona.querySelector('#f-pagina');
  marcarSucio(false);
  f.addEventListener('input', (e) => { if (e.target.type !== 'file') marcarSucio(true); });

  // ----- Textos -----
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {};
    const quitar = [];
    for (const el of f.querySelectorAll('input[name], textarea[name]')) {
      const k = el.name;
      let v = el.value.trim();
      if (k === 'instagram') v = v.replace(/^.*instagram\.com\//i, '').replace(/[/?].*$/, '').replace(/^@/, '');
      if (k === 'correo' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        await confirmar({ titulo: 'Revisa tu correo', texto: 'El correo no parece estar bien escrito. Debe ser algo como <b>nombre@gmail.com</b>.', si: 'Entendido', soloAceptar: true });
        el.focus();
        return;
      }
      if (k === 'telefono' && v && NM.numeroWhatsapp(v).length < 10) {
        await confirmar({ titulo: 'Revisa tu teléfono', texto: 'Escríbelo completo, con el código de Chile. Ej: <b>+56 9 3370 1311</b>.', si: 'Entendido', soloAceptar: true });
        el.focus();
        return;
      }
      if (!v || v === original(k)) { quitar.push(k); v = original(k); }
      else nuevo[k] = v;
      el.value = v;
      guardados[k] = nuevo[k] || '';
    }
    try {
      await nube.guardarTextos(nuevo, quitar);
      limpiarCacheTextos();
      marcarSucio(false);
      avisar('Cambios guardados. Ya se ven en tu página.');
    } catch (x) { avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error'); }
  });

  // ----- Fotos de un campo: una o varias (con varias, en la página van rotando) -----
  // Se guardan en sitio/textos separadas por saltos de línea.
  f.querySelectorAll('[data-campo-foto]').forEach(caja => {
    const k = caja.dataset.campoFoto;
    const pintarFotos = () => editorFotos(caja.querySelector('[data-fotos-editar]'), {
      lista: valor(k).split('\n').filter(Boolean),
      originales: [original(k)],
      minimo: 1,
      ayuda: 'Si subes más de una, en tu página se van turnando solas cada pocos segundos.',
      guardar: async (nueva) => {
        await nube.guardarTextos(nueva ? { [k]: nueva.join('\n') } : {}, nueva ? [] : [k]);
        guardados[k] = nueva ? nueva.join('\n') : '';
        pintarFotos();
      }
    });
    pintarFotos();
  });

  // ----- Galerías (portafolio y secciones "Más fotos") -----
  f.querySelectorAll('[data-galeria-editar]').forEach(caja => {
    const nombre = caja.dataset.galeriaEditar;
    const pintarGaleria = () => editorFotos(caja, {
      lista: gals[nombre] || NM.GALERIAS[nombre] || [],
      originales: NM.GALERIAS[nombre] || [],
      cambiada: !!gals[nombre],
      guardar: async (nueva) => {
        await nube.guardarGaleria(nombre, nueva);
        if (nueva) gals[nombre] = nueva; else delete gals[nombre];
        pintarGaleria();
      }
    });
    pintarGaleria();
  });
}

/** Lista de fotos para subir varias, ordenarlas y quitarlas. Todo se guarda apenas cambia.
    guardar(nueva) recibe la lista nueva, o null para volver a las originales.
    minimo: 1 cuando el lugar no puede quedar sin foto (al quitar la última vuelve la original). */
function editorFotos(caja, { lista: actual, originales, guardar: guardarLista, minimo = 0, cambiada, ayuda = '' }) {
  const lista = [...actual];
  const esOriginal = (l) => l.length === originales.length && l.every((x, i) => x === originales[i]);
  const hayCambios = cambiada ?? !esOriginal(lista);
  const unaOriginal = originales.length === 1;
  caja.innerHTML = `
    <p class="ayuda-chica">${lista.length > 1 ? 'Aparecen en este orden; con las flechas las mueves. Las fotos nuevas quedan al principio.' : lista.length ? '' : 'Todavía no hay fotos aquí. Sube las que quieras.'} ${ayuda} Todo se guarda solo.</p>
    ${lista.length > 1 ? `<p class="etiqueta-campo">Fotos <span class="contador">${lista.length}</span></p>` : ''}
    <ul class="fotos-lista galeria-editar">${lista.map((f, j) => `<li><img src="${esc(NM.foto(f))}" alt="Foto ${j + 1}" loading="lazy">
      ${lista.length > 1 ? `<span class="foto-num">${j + 1}</span>` : ''}
      <div class="foto-controles">
        <button type="button" class="icono" data-mover="${j}/-1" ${j === 0 ? 'disabled' : ''} aria-label="Mover la foto ${j + 1} antes">${ICO.izquierda}</button>
        <button type="button" class="icono peligro" data-quitar="${j}" aria-label="Quitar la foto ${j + 1}">${ICO.basura}</button>
        <button type="button" class="icono" data-mover="${j}/1" ${j === lista.length - 1 ? 'disabled' : ''} aria-label="Mover la foto ${j + 1} después">${ICO.derecha}</button>
      </div></li>`).join('')}</ul>
    <div class="botones-fila">
      <label class="btn subir-archivo">${ICO.subir} ${lista.length ? 'Agregar fotos' : 'Subir fotos'}<input type="file" accept="image/*" multiple data-subir-galeria hidden></label>
      ${hayCambios && (lista.length || originales.length) ? `<button type="button" class="btn btn-borde" data-restaurar>${!originales.length ? 'Quitar todas las fotos' : unaOriginal ? 'Volver a la foto original' : 'Volver a las fotos originales'}</button>` : ''}
    </div>
    <div class="subida" hidden><div class="progreso"><span></span></div><p></p></div>`;

  const guardar = async (nueva, texto) => {
    try {
      await guardarLista(nueva && esOriginal(nueva) ? null : nueva);
      limpiarCacheTextos();
      avisar(texto);
      return true;
    } catch (x) {
      avisar('No se pudo guardar. Revisa tu internet y vuelve a intentarlo.', 'error');
      return false;
    }
  };

  caja.querySelectorAll('[data-mover]').forEach(b => b.onclick = async () => {
    if (await esperarSubidaFoto()) return;
    const [j, d] = b.dataset.mover.split('/').map(Number);
    [lista[j], lista[j + d]] = [lista[j + d], lista[j]];
    guardar(lista, 'Orden guardado');
  });
  caja.querySelectorAll('[data-quitar]').forEach(b => b.onclick = async () => {
    if (await esperarSubidaFoto()) return;
    const j = Number(b.dataset.quitar);
    const ultima = lista.length <= minimo;
    if (ultima && esOriginal(lista)) {
      await confirmar({ titulo: 'Este lugar necesita una foto', texto: 'Para cambiarla, primero agrega otra foto y después quita esta.', si: 'Entendido', soloAceptar: true });
      return;
    }
    const ok = await confirmar(ultima
      ? { titulo: '¿Quitar esta foto?', texto: 'Este lugar necesita una foto, así que vuelve la que estaba al principio.', si: 'Sí, volver a la original', no: 'No' }
      : { titulo: `¿Quitar la foto ${j + 1}?`, texto: 'La foto deja de verse en tu página.', si: 'Sí, quitarla', no: 'No', peligro: true });
    if (!ok) return;
    const [quitada] = lista.splice(j, 1);
    if (await guardar(ultima ? null : lista, ultima ? 'Volvió la foto original' : 'Foto quitada')) borrarFotoSubida(quitada);
  });
  caja.querySelector('[data-restaurar]')?.addEventListener('click', async () => {
    if (await esperarSubidaFoto()) return;
    const ok = originales.length
      ? await confirmar({ titulo: unaOriginal ? '¿Volver a la foto original?' : '¿Volver a las fotos originales?', texto: 'Se quitan las fotos que subiste y vuelve lo que estaba al principio. Esto no se puede deshacer.', si: 'Sí, volver a lo original', no: 'No', peligro: true })
      : await confirmar({ titulo: '¿Quitar todas las fotos?', texto: 'Se quitan todas las fotos de esta sección y deja de mostrarse en tu página. Esto no se puede deshacer.', si: 'Sí, quitarlas', no: 'No', peligro: true });
    if (!ok) return;
    if (await guardar(null, originales.length ? 'Volvió lo original' : 'Fotos quitadas')) lista.forEach(borrarFotoSubida);
  });

  // Varias fotos a la vez, una tras otra, con su avance
  caja.querySelector('[data-subir-galeria]').onchange = async (e) => {
    const archivos = [...e.target.files];
    e.target.value = '';
    if (!archivos.length || await esperarSubidaFoto()) return;
    const subida = caja.querySelector('.subida');
    const barra = subida.querySelector('.progreso span');
    subida.hidden = false;
    subiendo++;
    const nuevas = [];
    try {
      for (const [n, archivo] of archivos.entries()) {
        subida.querySelector('p').innerHTML = `<b>Subiendo foto ${n + 1} de ${archivos.length}…</b> No cierres esta página hasta que termine.`;
        barra.style.width = Math.round(100 * n / archivos.length) + '%';
        const url = await subirFotoPublica(archivo);
        if (url) nuevas.push(url);
      }
    } catch (x) {
      avisar('No se pudieron subir todas las fotos. Revisa tu internet y vuelve a intentarlo.', 'error');
    }
    subiendo = Math.max(0, subiendo - 1);
    subida.hidden = true;
    if (nuevas.length) guardar([...nuevas, ...lista], nuevas.length === 1 ? 'Foto subida y guardada' : `${nuevas.length} fotos subidas y guardadas`);
  };
}

// ---------- Ventas ----------
// Teléfono chileno para wa.me: "9 1234 5678" -> "56912345678"
const whatsappDe = (t) => { const n = String(t).replace(/\D/g, ''); return n.length === 9 ? '56' + n : n; };

async function ventas() {
  cargando('ventas');
  const [v, alumnas] = await Promise.all([nube.ventas(), nube.totalAlumnas()]);
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const delMes = v.filter(x => fechaDe(x) >= mes);
  const suma = (l) => l.reduce((s, x) => s + (x.monto || 0), 0);
  const fecha = (x) => fechaDe(x).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  marco('ventas', `
    <h2 class="panel-titulo">Mis ventas</h2>
    <div class="resumen-panel">
      <div><span>Este mes</span><b>${clp(suma(delMes))}</b><small>${delMes.length} venta${delMes.length === 1 ? '' : 's'}</small></div>
      <div><span>Desde el comienzo</span><b>${clp(suma(v))}</b><small>${v.length} venta${v.length === 1 ? '' : 's'}</small></div>
      <div><span>Estudiantes</span><b>${alumnas}</b><small>personas con cuenta</small></div>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>El dinero llega a tu cuenta de Mercado Pago. Ahí mismo ves cuánto descontó de comisión. En las <b>clases presenciales</b> tienes el WhatsApp de cada persona para coordinar el horario.</span></p>
    ${v.length ? `<ul class="ventas">${v.map(x => `<li>
        <div><b>${esc(x.nombre || 'Estudiante')}</b><span>${esc(x.correo)}</span>${x.telefono ? `<span>${esc(x.telefono)}</span>` : ''}</div>
        <div><span class="estado ${x.tipo === 'presencial' ? 'estado-falta' : ''}">${x.tipo === 'presencial' ? 'Clase presencial' : 'Curso online'}</span><span>${esc(x.titulo)}</span><span>${fecha(x)}</span></div>
        <b class="monto">${clp(x.monto)}</b>
        ${x.tipo === 'presencial' ? `<div class="venta-coordinar">
          ${x.nota ? `<p><b>Su comentario:</b> ${esc(x.nota)}</p>` : ''}
          ${x.telefono ? `<a class="btn btn-chico" href="https://wa.me/${esc(whatsappDe(x.telefono))}?text=${encodeURIComponent(`Hola ${(x.nombre || '').split(' ')[0]}, soy Daniela. Recibí tu pago de "${x.titulo}". ¿Coordinamos el horario?`)}" target="_blank" rel="noopener">Escribirle por WhatsApp</a>` : ''}
        </div>` : ''}
      </li>`).join('')}</ul>` : '<div class="vacio"><p>Todavía no tienes ventas. Cuando alguien compre un curso, aparecerá aquí.</p></div>'}`);
}

// ---------- Navegación ----------
async function mostrar() {
  const [seccion, id] = location.hash.slice(1).split('/');
  if (location.hash !== hashAnterior && hashAnterior && !await salirSinGuardar()) {
    history.replaceState(null, '', hashAnterior);
    return;
  }
  hashAnterior = location.hash || '#inicio';
  window.scrollTo({ top: 0 });
  try {
    if (seccion === 'curso' && id) await editarCurso(decodeURIComponent(id));
    else if (seccion === 'cursos') await cursos();
    else if (seccion === 'presencial' && id) await editarPresencial(decodeURIComponent(id));
    else if (seccion === 'presenciales') await presenciales();
    else if (seccion === 'talleres') await talleres();
    else if (seccion === 'pagina' && id) await editarPagina(decodeURIComponent(id));
    else if (seccion === 'paginas' || seccion === 'textos') await paginas();
    else if (seccion === 'ventas') await ventas();
    else await inicio();
  } catch (e) {
    console.error(e);
    marco(seccion || 'inicio', '<div class="vacio"><p>No se pudo cargar. Revisa tu internet y recarga la página.</p></div>');
  }
}

async function iniciar() {
  main.innerHTML = '<section class="banda"><div class="wrap"><p class="vacio">Cargando…</p></div></section>';
  const u = await nube.usuarioListo();
  if (!u) return entrada();
  if (!await nube.esAdmin(u)) {
    await nube.salir();
    return entrada('Esta cuenta no tiene acceso al panel.');
  }
  await u.getIdToken(true); // trae la marca de administradora para poder subir archivos
  hashAnterior = '';
  window.onhashchange = mostrar;
  mostrar();
}

iniciar();
