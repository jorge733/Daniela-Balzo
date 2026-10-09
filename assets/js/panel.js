/* Panel privado de Daniela: textos del sitio, cursos online y ventas. */
(() => {
  const { esc, clp } = NM;
  const main = document.getElementById('contenido');
  const IMAGENES = ['cursos-02', 'cursos-03', 'cursos-04', 'cursos-05', 'cursos-06', 'cursos-07',
    'clases-online-01', 'clases-online-02', 'clases-online-03', 'inicio-02', 'inicio-03', 'accesorios-01', 'vestuario-01'];
  let pestaña = 'cursos';
  let entro = false;

  const aviso = (texto) => {
    const t = document.getElementById('toast');
    t.textContent = texto;
    t.hidden = false;
    clearTimeout(aviso.timer);
    aviso.timer = setTimeout(() => t.hidden = true, 2200);
  };

  function entrada() {
    main.innerHTML = `
    <section class="banda banda-lila">
      <div class="wrap" style="max-width: 460px">
        <h1>Panel de Daniela</h1>
        <p>Desde aquí cambias los textos de tu página, creas cursos online, subes videos y ves tus ventas.</p>
        <form class="form" id="f-panel">
          <label>Clave del panel<input id="p-clave" type="password" autocomplete="current-password" placeholder="En el prototipo puedes dejarla vacía"></label>
          <button class="btn" type="submit">Entrar al panel</button>
        </form>
      </div>
    </section>`;
    document.getElementById('f-panel').addEventListener('submit', (e) => { e.preventDefault(); entro = true; render(); });
  }

  function render() {
    if (!entro) return entrada();
    const pestañas = [['cursos', 'Cursos online'], ['textos', 'Textos de la página'], ['ventas', 'Ventas y alumnas']];
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <div class="pie-tarjeta" style="padding: 0; margin-bottom: 20px">
          <h1 style="margin: 0">Hola, Daniela</h1>
          <button class="btn btn-borde btn-chico" id="reset" type="button">Restablecer datos de prueba</button>
        </div>
        <div class="panel-tabs" role="tablist">
          ${pestañas.map(([k, t]) => `<button role="tab" type="button" data-tab="${k}" aria-selected="${k === pestaña}">${t}</button>`).join('')}
        </div>
        <div id="zona"></div>
      </div>
    </section>`;
    main.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { pestaña = b.dataset.tab; render(); });
    document.getElementById('reset').onclick = (e) => {
      if (e.target.dataset.confirmar) { NM.restablecer(); aviso('Datos de prueba restablecidos'); render(); return; }
      e.target.dataset.confirmar = '1';
      e.target.textContent = '¿Seguro? Haz clic otra vez';
    };
    ({ cursos, textos, ventas })[pestaña](document.getElementById('zona'));
  }

  // ---------- Cursos ----------
  function cursos(zona) {
    const lista = NM.cursos();
    zona.innerHTML = `
      <div class="pie-tarjeta" style="padding: 0 0 18px">
        <p style="margin: 0">Tienes ${lista.length} curso${lista.length === 1 ? '' : 's'} online. Los cursos <b>publicados</b> aparecen en tu página.</p>
        <button class="btn btn-chico" id="nuevo" type="button">+ Nuevo curso</button>
      </div>
      ${lista.map((c, n) => `
      <form class="editor-curso form" data-n="${n}">
        <div class="fila">
          <label>Nombre del curso<input name="titulo" value="${esc(c.titulo)}" required></label>
          <label>Precio (CLP)<input name="precio" type="number" min="0" step="1000" value="${c.precio}" required></label>
        </div>
        <label>Descripción<textarea name="resumen" rows="3">${esc(c.resumen)}</textarea></label>
        <div class="fila">
          <label>Foto del curso
            <select name="imagen">${IMAGENES.map(i => `<option value="${i}.jpg" ${c.imagen === i + '.jpg' ? 'selected' : ''}>${i}</option>`).join('')}</select>
          </label>
          <label style="display: flex; gap: 8px; align-items: center; align-self: end; padding-bottom: 10px">
            <input type="checkbox" name="publicado" ${c.publicado ? 'checked' : ''} style="width: auto"> Publicado en la página
          </label>
        </div>
        <div>
          <b>Clases del curso</b>
          <div class="lista-lecciones">
            ${c.lecciones.map((l, j) => `<div>
              <input name="leccion" value="${esc(l.titulo)}" aria-label="Clase ${j + 1}">
              <label class="btn btn-borde btn-chico" style="display: inline-block; font-weight: 600">${l.video ? 'Video: ' + esc(l.video) : 'Subir video'}
                <input type="file" accept="video/*" data-j="${j}" hidden></label>
            </div>`).join('')}
          </div>
          <button class="btn btn-borde btn-chico" type="button" data-agregar>+ Agregar clase</button>
        </div>
        <label>Materiales descargables (uno por línea)<textarea name="materiales" rows="3">${esc((c.materiales || []).join('\n'))}</textarea></label>
        <div class="botones">
          <button class="btn" type="submit">Guardar cambios</button>
          <a class="btn btn-borde" href="curso.html?id=${encodeURIComponent(c.id)}" target="_blank">Ver en la página</a>
          <button class="btn btn-borde" type="button" data-borrar>Eliminar curso</button>
        </div>
      </form>`).join('')}`;

    const leer = (f, c) => ({
      ...c,
      titulo: f.titulo.value.trim(),
      precio: Number(f.precio.value),
      resumen: f.resumen.value.trim(),
      imagen: f.imagen.value,
      publicado: f.publicado.checked,
      lecciones: [...f.querySelectorAll('[name=leccion]')].map((i, j) => ({ ...c.lecciones[j], titulo: i.value.trim() || 'Clase ' + (j + 1) })),
      materiales: f.materiales.value.split('\n').map(s => s.trim()).filter(Boolean)
    });

    document.getElementById('nuevo').onclick = () => {
      lista.unshift({ id: 'curso-' + Date.now().toString(36), titulo: 'Nuevo curso', resumen: '', precio: 30000, imagen: 'cursos-05.jpg', publicado: false, lecciones: [{ titulo: 'Clase 1', duracion: '' }], materiales: [] });
      NM.guardarCursos(lista);
      cursos(zona);
      aviso('Curso creado. Complétalo y publícalo.');
    };
    zona.querySelectorAll('.editor-curso').forEach(f => {
      const n = Number(f.dataset.n);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        lista[n] = leer(f, lista[n]);
        NM.guardarCursos(lista);
        aviso('Cambios guardados');
      });
      f.querySelector('[data-agregar]').onclick = () => {
        lista[n] = leer(f, lista[n]);
        lista[n].lecciones.push({ titulo: 'Clase ' + (lista[n].lecciones.length + 1), duracion: '' });
        NM.guardarCursos(lista);
        cursos(zona);
      };
      f.querySelector('[data-borrar]').onclick = (e) => {
        if (!e.target.dataset.confirmar) { e.target.dataset.confirmar = '1'; e.target.textContent = '¿Seguro? Clic otra vez'; return; }
        lista.splice(n, 1);
        NM.guardarCursos(lista);
        cursos(zona);
        aviso('Curso eliminado');
      };
      f.querySelectorAll('input[type=file]').forEach(inp => inp.onchange = () => {
        if (!inp.files[0]) return;
        lista[n] = leer(f, lista[n]);
        lista[n].lecciones[Number(inp.dataset.j)].video = inp.files[0].name;
        NM.guardarCursos(lista);
        cursos(zona);
        aviso('Video listo (en el prototipo solo se guarda el nombre)');
      });
    });
  }

  // ---------- Textos ----------
  function textos(zona) {
    const t = NM.textos();
    const campos = [
      ['nombre', 'Nombre en el encabezado'], ['linea1', 'Primera línea bajo el nombre'], ['linea2', 'Segunda línea bajo el nombre'],
      ['cursosTitulo', 'Inicio: título de cursos'], ['cursosTexto', 'Inicio: texto de cursos'],
      ['onlineTitulo', 'Cursos online: título'], ['onlineTexto', 'Cursos online: texto']
    ];
    zona.innerHTML = `
      <form class="form angosto" id="f-textos" style="margin: 0">
        ${campos.map(([k, l]) => `<label>${l}<input name="${k}" value="${esc(t[k])}"></label>`).join('')}
        <div class="botones"><button class="btn" type="submit">Guardar textos</button><a class="btn btn-borde" href="index.html" target="_blank">Ver la página</a></div>
        <p class="nota">En la versión final también podrás cambiar las fotos de las galerías, los precios de las clases presenciales y el resto de los textos.</p>
      </form>`;
    document.getElementById('f-textos').addEventListener('submit', (e) => {
      e.preventDefault();
      const nuevo = {};
      campos.forEach(([k]) => nuevo[k] = e.target[k].value.trim());
      NM.guardarTextos(nuevo);
      aviso('Textos guardados');
    });
  }

  // ---------- Ventas ----------
  function ventas(zona) {
    const v = NM.ventas();
    const total = v.reduce((s, x) => s + x.monto, 0);
    const alumnas = NM.usuarios();
    zona.innerHTML = `
      <div class="tarjetas" style="margin-bottom: 28px">
        <div class="ficha"><span class="modalidad">Ventas</span><div class="precio-grande">${v.length}</div></div>
        <div class="ficha"><span class="modalidad">Total vendido</span><div class="precio-grande">${clp(total)}</div></div>
        <div class="ficha"><span class="modalidad">Alumnas</span><div class="precio-grande">${alumnas.length}</div></div>
      </div>
      <h2>Últimas ventas</h2>
      ${v.length ? `<div class="tabla-wrap"><table class="tabla">
        <thead><tr><th>Fecha</th><th>Alumna</th><th>Curso</th><th class="num">Monto</th></tr></thead>
        <tbody>${v.map(x => `<tr><td>${new Date(x.fecha).toLocaleDateString('es-CL')}</td><td>${esc(x.nombre)}<br><span class="nota">${esc(x.correo)}</span></td><td>${esc(x.titulo)}</td><td class="num">${clp(x.monto)}</td></tr>`).join('')}</tbody>
      </table></div>` : `<p class="vacio">Aún no hay ventas. Prueba comprar un curso desde <a href="cursos-online.html">Cursos online</a> y vuelve aquí.</p>`}`;
  }

  render();
})();
