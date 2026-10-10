/* Panel privado de Daniela: cursos online (con videos y materiales), textos del sitio y ventas. */
import * as nube from './nube.js';

const { esc, clp } = NM;
const main = document.getElementById('contenido');
const IMAGENES = ['cursos-02', 'cursos-03', 'cursos-04', 'cursos-05', 'cursos-06', 'cursos-07',
  'clases-online-01', 'clases-online-02', 'clases-online-03', 'inicio-02', 'inicio-03', 'accesorios-01', 'vestuario-01'];
let pestaña = 'cursos';

const aviso = (texto) => {
  const t = document.getElementById('toast');
  t.textContent = texto;
  t.hidden = false;
  clearTimeout(aviso.timer);
  aviso.timer = setTimeout(() => t.hidden = true, 2600);
};

// Nombre de archivo seguro para Storage: "Clase 1 (final).mp4" -> "clase-1-final.mp4"
const nombreArchivo = (f) => {
  const punto = f.name.lastIndexOf('.');
  const base = (punto > 0 ? f.name.slice(0, punto) : f.name).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'archivo';
  return `${Date.now().toString(36)}-${base}${punto > 0 ? f.name.slice(punto).toLowerCase() : ''}`;
};

// Duración de un video local, como "18 min"
const duracionVideo = (archivo) => new Promise((ok) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); ok(v.duration ? Math.max(1, Math.round(v.duration / 60)) + ' min' : ''); };
  v.onerror = () => ok('');
  v.src = URL.createObjectURL(archivo);
});

function entrada(error = '') {
  main.innerHTML = `
  <section class="banda banda-lila">
    <div class="wrap" style="max-width: 460px">
      <h1>Panel de Daniela</h1>
      <p>Desde aquí cambias los textos de tu página, creas cursos online, subes videos y ves tus ventas.</p>
      <form class="form" id="f-panel">
        <label>Correo<input id="p-correo" type="email" autocomplete="email" required></label>
        <label>Contraseña<input id="p-clave" type="password" autocomplete="current-password" required></label>
        <p class="error" id="p-error" role="alert">${esc(error)}</p>
        <button class="btn" type="submit">Entrar al panel</button>
        <p class="nota"><button class="enlace" type="button" id="p-olvide">¿Olvidaste tu contraseña?</button></p>
      </form>
    </div>
  </section>`;
  const err = document.getElementById('p-error');
  document.getElementById('f-panel').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await nube.entrar(document.getElementById('p-correo').value.trim(), document.getElementById('p-clave').value);
      iniciar();
    } catch (x) { err.textContent = nube.mensajeError(x); }
  });
  document.getElementById('p-olvide').onclick = async () => {
    const correo = document.getElementById('p-correo').value.trim();
    if (!correo) { err.textContent = 'Escribe tu correo y vuelve a hacer clic.'; return; }
    try { await nube.recuperarClave(correo); } catch (x) {}
    err.textContent = 'Si ese correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.';
  };
}

function render() {
  const pestañas = [['cursos', 'Cursos online'], ['textos', 'Textos de la página'], ['ventas', 'Ventas y alumnas']];
  main.innerHTML = `
  <section class="banda">
    <div class="wrap">
      <div class="pie-tarjeta" style="padding: 0; margin-bottom: 20px">
        <h1 style="margin: 0">Hola, Daniela</h1>
        <button class="btn btn-borde btn-chico" id="salir" type="button">Cerrar sesión</button>
      </div>
      <div class="panel-tabs" role="tablist">
        ${pestañas.map(([k, t]) => `<button role="tab" type="button" data-tab="${k}" aria-selected="${k === pestaña}">${t}</button>`).join('')}
      </div>
      <div id="zona"><p class="vacio">Cargando…</p></div>
    </div>
  </section>`;
  main.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { pestaña = b.dataset.tab; render(); });
  document.getElementById('salir').onclick = async () => { await nube.salir(); entrada(); };
  ({ cursos, textos, ventas })[pestaña](document.getElementById('zona')).catch(() => {
    document.getElementById('zona').innerHTML = '<p class="error">No se pudo cargar. Revisa tu conexión y recarga la página.</p>';
  });
}

// ---------- Cursos ----------
async function cursos(zona) {
  const lista = await nube.todosLosCursos();
  zona.innerHTML = `
    <div class="pie-tarjeta" style="padding: 0 0 18px">
      <p style="margin: 0">Tienes ${lista.length} curso${lista.length === 1 ? '' : 's'} online. Los cursos <b>publicados</b> aparecen en tu página.</p>
      <button class="btn btn-chico" id="nuevo" type="button">+ Nuevo curso</button>
    </div>
    ${lista.length ? '' : '<p class="vacio">Aún no tienes cursos. Crea el primero con el botón "+ Nuevo curso".</p>'}
    ${lista.map((c, n) => `
    <form class="editor-curso form" data-n="${n}">
      <div class="fila">
        <label>Nombre del curso<input name="titulo" value="${esc(c.titulo)}" required maxlength="120"></label>
        <label>Precio (CLP)<input name="precio" type="number" min="1000" step="500" value="${c.precio}" required></label>
      </div>
      <label>Descripción<textarea name="resumen" rows="3" maxlength="600">${esc(c.resumen)}</textarea></label>
      <label>Qué necesita la alumna<input name="requisitos" value="${esc(c.requisitos || '')}" maxlength="300" placeholder="Una máquina de coser que funcione y materiales básicos de costura."></label>
      <div class="fila">
        <div class="campo-foto">
          <img src="${esc(NM.imagen(c))}" alt="">
          <label>Foto del curso
            <select name="imagen">
              ${/^https?:/.test(c.imagen) ? `<option value="${esc(c.imagen)}" selected>Foto subida</option>` : ''}
              ${IMAGENES.map(i => `<option value="${i}.jpg" ${c.imagen === i + '.jpg' ? 'selected' : ''}>${i}</option>`).join('')}
            </select>
          </label>
          <label class="btn btn-borde btn-chico subir">Subir otra foto<input type="file" accept="image/*" data-portada hidden></label>
        </div>
        <label class="casilla">
          <input type="checkbox" name="publicado" ${c.publicado ? 'checked' : ''}> Publicado en la página
        </label>
      </div>
      <div>
        <b>Clases del curso</b> <span class="nota">(videos en MP4, como los graba el celular)</span>
        <div class="lista-lecciones">
          ${c.lecciones.map((l, j) => `<div class="leccion" data-j="${j}">
            <input name="leccion" value="${esc(l.titulo)}" aria-label="Título de la clase ${j + 1}">
            <span class="estado-video">${l.video ? `Video listo${l.duracion ? ' · ' + esc(l.duracion) : ''}` : 'Sin video'}</span>
            <label class="btn btn-borde btn-chico">${l.video ? 'Cambiar video' : 'Subir video'}<input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.m4v,.webm" data-video="${j}" hidden></label>
            <button class="btn btn-borde btn-chico" type="button" data-quitar="${j}" aria-label="Quitar clase ${j + 1}">Quitar</button>
            <div class="progreso" hidden><span></span></div>
          </div>`).join('')}
        </div>
        <button class="btn btn-borde btn-chico" type="button" data-agregar>+ Agregar clase</button>
      </div>
      <div>
        <b>Materiales descargables</b> <span class="nota">(moldes, patrones o listas en PDF)</span>
        <ul class="lista-materiales">
          ${c.materiales.map((m, k) => `<li><span>${esc(m.nombre)}</span><button class="btn btn-borde btn-chico" type="button" data-quitar-material="${k}">Quitar</button></li>`).join('')}
        </ul>
        <label class="btn btn-borde btn-chico">+ Subir material<input type="file" accept=".pdf,image/*" data-material hidden></label>
        <div class="progreso" data-progreso-material hidden><span></span></div>
      </div>
      <div class="botones">
        <button class="btn" type="submit">Guardar cambios</button>
        <a class="btn btn-borde" href="curso.html?id=${encodeURIComponent(c.id)}" target="_blank">Ver en la página</a>
        <button class="btn btn-borde" type="button" data-borrar>Eliminar curso</button>
      </div>
    </form>`).join('')}`;

  // Lee los campos del formulario sobre el curso guardado
  const leer = (f, c) => ({
    ...c,
    titulo: f.titulo.value.trim(),
    precio: Math.round(Number(f.precio.value)),
    resumen: f.resumen.value.trim(),
    requisitos: f.requisitos.value.trim(),
    imagen: f.imagen.value,
    publicado: f.publicado.checked,
    lecciones: [...f.querySelectorAll('[name=leccion]')].map((i, j) => ({ ...c.lecciones[j], titulo: i.value.trim() || 'Clase ' + (j + 1) }))
  });
  const guardar = async (c, texto) => {
    await nube.guardarCurso(c);
    if (texto) aviso(texto);
  };

  document.getElementById('nuevo').onclick = async () => {
    const id = 'curso-' + Date.now().toString(36);
    await guardar({ id, titulo: 'Nuevo curso', resumen: '', requisitos: '', precio: 30000, imagen: 'cursos-05.jpg',
      publicado: false, orden: lista.length, lecciones: [{ titulo: 'Clase 1', duracion: '' }], materiales: [] }, 'Curso creado. Complétalo y publícalo.');
    cursos(zona);
  };

  zona.querySelectorAll('.editor-curso').forEach(f => {
    const n = Number(f.dataset.n);
    const c = () => lista[n];
    const enviar = f.querySelector('[type=submit]');

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      lista[n] = leer(f, c());
      if (lista[n].publicado && !lista[n].lecciones.some(l => l.video)) aviso('Ojo: el curso está publicado pero aún no tiene videos.');
      await guardar(lista[n], 'Cambios guardados');
    });
    f.imagen.onchange = () => { f.querySelector('.campo-foto img').src = NM.imagen({ imagen: f.imagen.value }); };
    f.querySelector('[data-agregar]').onclick = async () => {
      lista[n] = leer(f, c());
      lista[n].lecciones.push({ titulo: 'Clase ' + (lista[n].lecciones.length + 1), duracion: '' });
      await guardar(lista[n]);
      cursos(zona);
    };
    f.querySelectorAll('[data-quitar]').forEach(b => b.onclick = async () => {
      if (!b.dataset.confirmar) { b.dataset.confirmar = '1'; b.textContent = '¿Seguro?'; return; }
      lista[n] = leer(f, c());
      const [quitada] = lista[n].lecciones.splice(Number(b.dataset.quitar), 1);
      await guardar(lista[n], 'Clase quitada');
      if (quitada.video) nube.borrarArchivo(quitada.video);
      cursos(zona);
    });
    f.querySelector('[data-borrar]').onclick = async (e) => {
      if (await nube.tieneVentas(c().id)) { aviso('Este curso ya tiene alumnas: despublícalo en vez de eliminarlo.'); return; }
      if (!e.target.dataset.confirmar) { e.target.dataset.confirmar = '1'; e.target.textContent = '¿Seguro? Clic otra vez'; return; }
      await nube.borrarCurso(c().id);
      aviso('Curso eliminado');
      cursos(zona);
    };

    // Subida de videos con barra de avance
    f.querySelectorAll('[data-video]').forEach(inp => inp.onchange = async () => {
      const archivo = inp.files[0];
      if (!archivo) return;
      if (!/\.(mp4|m4v|mov|webm)$/i.test(archivo.name)) { aviso('Ese formato no se ve en todos los celulares. Sube el video en MP4.'); inp.value = ''; return; }
      const j = Number(inp.dataset.video);
      const fila = f.querySelector(`.leccion[data-j="${j}"]`);
      const barra = fila.querySelector('.progreso');
      const estado = fila.querySelector('.estado-video');
      barra.hidden = false;
      enviar.disabled = true;
      try {
        const [ruta, duracion] = await Promise.all([
          nube.subirArchivo(`cursos/${c().id}/videos/${nombreArchivo(archivo)}`, archivo, (p) => {
            barra.firstElementChild.style.width = p + '%';
            estado.textContent = `Subiendo… ${p}%`;
          }),
          duracionVideo(archivo)
        ]);
        lista[n] = leer(f, c());
        const anterior = lista[n].lecciones[j].video;
        lista[n].lecciones[j] = { ...lista[n].lecciones[j], video: ruta, duracion };
        await guardar(lista[n], 'Video subido');
        if (anterior) nube.borrarArchivo(anterior);
        cursos(zona);
      } catch (e) {
        estado.textContent = 'No se pudo subir. Intenta de nuevo.';
        barra.hidden = true;
        enviar.disabled = false;
      }
    });

    // Materiales
    f.querySelector('[data-material]').onchange = async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      const barra = f.querySelector('[data-progreso-material]');
      barra.hidden = false;
      try {
        const ruta = await nube.subirArchivo(`cursos/${c().id}/materiales/${nombreArchivo(archivo)}`, archivo,
          (p) => { barra.firstElementChild.style.width = p + '%'; });
        lista[n] = leer(f, c());
        lista[n].materiales = [...lista[n].materiales, { nombre: archivo.name.replace(/\.[^.]+$/, ''), ruta }];
        await guardar(lista[n], 'Material subido');
        cursos(zona);
      } catch (x) {
        barra.hidden = true;
        aviso('No se pudo subir el material');
      }
    };
    f.querySelectorAll('[data-quitar-material]').forEach(b => b.onclick = async () => {
      lista[n] = leer(f, c());
      const [quitado] = lista[n].materiales.splice(Number(b.dataset.quitarMaterial), 1);
      await guardar(lista[n], 'Material quitado');
      nube.borrarArchivo(quitado.ruta);
      cursos(zona);
    });

    // Foto propia del curso
    f.querySelector('[data-portada]').onchange = async (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      if (archivo.size > 8 * 1024 * 1024) { aviso('La foto pesa más de 8 MB. Usa una más liviana.'); return; }
      try {
        const ruta = await nube.subirArchivo(`portadas/${nombreArchivo(archivo)}`, archivo);
        lista[n] = { ...leer(f, c()), imagen: await nube.urlPublica(ruta) };
        await guardar(lista[n], 'Foto subida');
        cursos(zona);
      } catch (x) { aviso('No se pudo subir la foto'); }
    };
  });
}

// ---------- Textos ----------
async function textos(zona) {
  const t = { ...NM.TEXTOS, ...await nube.textos() };
  const campos = [
    ['nombre', 'Nombre en el encabezado'], ['linea1', 'Primera línea bajo el nombre'], ['linea2', 'Segunda línea bajo el nombre'],
    ['cursosTitulo', 'Inicio: título de cursos'], ['cursosTexto', 'Inicio: texto de cursos'],
    ['onlineTitulo', 'Cursos online: título'], ['onlineTexto', 'Cursos online: texto']
  ];
  zona.innerHTML = `
    <form class="form angosto" id="f-textos" style="margin: 0">
      ${campos.map(([k, l]) => `<label>${l}<input name="${k}" value="${esc(t[k])}" maxlength="200"></label>`).join('')}
      <div class="botones"><button class="btn" type="submit">Guardar textos</button><a class="btn btn-borde" href="index.html" target="_blank">Ver la página</a></div>
    </form>`;
  document.getElementById('f-textos').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {};
    campos.forEach(([k]) => nuevo[k] = e.target[k].value.trim() || NM.TEXTOS[k]);
    await nube.guardarTextos(nuevo);
    try { sessionStorage.removeItem('nm_textos'); } catch (x) {}
    aviso('Textos guardados');
  });
}

// ---------- Ventas ----------
async function ventas(zona) {
  const [v, alumnas] = await Promise.all([nube.ventas(), nube.totalAlumnas()]);
  const total = v.reduce((s, x) => s + (x.monto || 0), 0);
  const fecha = (x) => (x.fecha && x.fecha.toDate ? x.fecha.toDate() : new Date(x.fecha)).toLocaleDateString('es-CL');
  zona.innerHTML = `
    <div class="tarjetas" style="margin-bottom: 28px">
      <div class="ficha"><span class="modalidad">Ventas</span><div class="precio-grande">${v.length}</div></div>
      <div class="ficha"><span class="modalidad">Total vendido</span><div class="precio-grande">${clp(total)}</div></div>
      <div class="ficha"><span class="modalidad">Alumnas registradas</span><div class="precio-grande">${alumnas}</div></div>
    </div>
    <p class="nota">El dinero de cada venta llega a tu cuenta de Mercado Pago, menos su comisión.</p>
    <h2>Últimas ventas</h2>
    ${v.length ? `<div class="tabla-wrap"><table class="tabla">
      <thead><tr><th>Fecha</th><th>Alumna</th><th>Curso</th><th class="num">Monto</th></tr></thead>
      <tbody>${v.map(x => `<tr><td>${fecha(x)}</td><td>${esc(x.nombre)}<br><span class="nota">${esc(x.correo)}</span></td><td>${esc(x.titulo)}</td><td class="num">${clp(x.monto)}</td></tr>`).join('')}</tbody>
    </table></div>` : '<p class="vacio">Aún no hay ventas.</p>'}`;
}

async function iniciar() {
  main.innerHTML = '<section class="banda"><div class="wrap"><p class="vacio">Cargando…</p></div></section>';
  const u = await nube.usuarioListo();
  if (!u) return entrada();
  if (!await nube.esAdmin(u)) {
    await nube.salir();
    return entrada('Esta cuenta no tiene acceso al panel.');
  }
  render();
}

iniciar();
