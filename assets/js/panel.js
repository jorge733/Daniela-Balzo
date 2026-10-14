/* Panel privado de Daniela.
   Pensado para usarse sin conocimientos técnicos: una cosa a la vez, palabras simples,
   botones grandes y confirmación antes de borrar.  Secciones: #inicio, #cursos, #curso/<id>, #textos, #ventas */
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
  ['cursos', 'Mis cursos', ICO.cursos],
  ['textos', 'Textos de mi página', ICO.textos],
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
      <a class="accion" href="#textos">${ICO.textos}<b>Cambiar textos de mi página</b><span>Tu nombre, tu descripción y los títulos.</span></a>
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
      <h2 class="panel-titulo">Mis cursos online</h2>
      <button class="btn" type="button" id="nuevo">${ICO.mas} Crear curso nuevo</button>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>Haz clic en un curso para cambiarlo o subirle videos. Solo los cursos marcados como <b>"En tu página"</b> los pueden ver y comprar tus alumnas.</span></p>
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
          <small>2 o 3 líneas: qué aprende la alumna y qué va a hacer.</small></label>
        <label>¿Qué necesita la alumna?
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
        <p class="ayuda-chica">Moldes, patrones o listas en PDF. Las alumnas los descargan desde Mis cursos. Es opcional.</p>
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
        <p class="aviso-publicar" id="aviso-publicar" hidden>${ICO.alerta}<span>Ojo: hay clases sin video. Tus alumnas verán "Daniela todavía no sube este video" en esas clases.</span></p>
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
    // Aviso si el video es muy pesado: cada vez que una alumna lo ve se gasta de la parte gratis.
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
    if (!await confirmar({ titulo: '¿Quitar este material?', texto: `Vas a quitar <b>"${esc(m.nombre)}"</b>. Tus alumnas ya no podrán descargarlo.`, si: 'Sí, quitarlo', no: 'No', peligro: true })) return;
    leer();
    c.materiales.splice(k, 1);
    if (await guardar('Material quitado')) { nube.borrarArchivo(m.ruta); pintarEditor(c); }
  });

  // Eliminar curso
  document.getElementById('borrar-curso').onclick = async () => {
    if (await nube.tieneVentas(c.id)) {
      await confirmar({ titulo: 'Este curso ya tiene alumnas', texto: 'Como ya lo compraron, no se puede eliminar: perderían su acceso. Si no quieres venderlo más, apaga "Mostrar este curso en mi página" (paso 5).', si: 'Entendido', soloAceptar: true });
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

// ---------- Textos ----------
const GRUPOS_TEXTOS = [
  ['Arriba en todas las páginas y en el pie', [
    ['nombre', 'Tu nombre', 'Aparece en grande en la portada y arriba a la izquierda.'],
    ['linea1', 'Lo que haces', 'La primera línea bajo tu nombre en la portada.'],
    ['linea2', 'Segunda línea', 'La línea que va justo debajo.']
  ]],
  ['En la página de inicio', [
    ['cursosTitulo', 'Título de la sección de cursos', ''],
    ['cursosTexto', 'Texto bajo ese título', '']
  ]],
  ['En la sección de cursos online', [
    ['onlineTitulo', 'Título', 'Se ve en el inicio y en la página de cursos online.'],
    ['onlineTexto', 'Texto bajo el título', '']
  ]]
];

async function textos() {
  cargando('textos');
  const t = { ...NM.TEXTOS, ...await nube.textos() };
  marco('textos', `
    <h2 class="panel-titulo">Textos de mi página</h2>
    <p class="ayuda">${ICO.ayuda}<span>Cambia lo que quieras y toca <b>Guardar cambios</b>. Si borras un texto, vuelve el original.</span></p>
    <form id="f-textos" class="editor">
      ${GRUPOS_TEXTOS.map(([grupo, campos]) => `<section class="paso">
        <h3>${grupo}</h3>
        ${campos.map(([k, l, ayuda]) => `<label>${l}
          <input name="${k}" value="${esc(t[k])}" maxlength="200">
          ${ayuda ? `<small>${ayuda}</small>` : ''}</label>`).join('')}
      </section>`).join('')}
      <div class="barra-guardar">
        <span id="estado-guardado">${ICO.ok} Todo guardado</span>
        <a class="btn btn-borde" href="./" target="_blank" rel="noopener">${ICO.ojo} Ver mi página</a>
        <button class="btn btn-grande" type="submit">Guardar cambios</button>
      </div>
    </form>`);
  const f = document.getElementById('f-textos');
  marcarSucio(false);
  f.addEventListener('input', () => marcarSucio(true));
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {};
    GRUPOS_TEXTOS.forEach(([, campos]) => campos.forEach(([k]) => {
      nuevo[k] = f[k].value.trim() || NM.TEXTOS[k];
      f[k].value = nuevo[k];
    }));
    try {
      await nube.guardarTextos(nuevo);
      try { sessionStorage.removeItem('nm_textos'); } catch (x) {}
      marcarSucio(false);
      avisar('Textos guardados. Ya se ven en tu página.');
    } catch (x) { avisar('No se pudo guardar. Revisa tu internet.', 'error'); }
  });
}

// ---------- Ventas ----------
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
      <div><span>Alumnas registradas</span><b>${alumnas}</b><small>personas con cuenta</small></div>
    </div>
    <p class="ayuda">${ICO.ayuda}<span>El dinero llega a tu cuenta de Mercado Pago. Ahí mismo ves cuánto descontó de comisión.</span></p>
    ${v.length ? `<ul class="ventas">${v.map(x => `<li>
        <div><b>${esc(x.nombre || 'Alumna')}</b><span>${esc(x.correo)}</span></div>
        <div><span>${esc(x.titulo)}</span><span>${fecha(x)}</span></div>
        <b class="monto">${clp(x.monto)}</b>
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
    else if (seccion === 'textos') await textos();
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
