/* Aula virtual: inicio de sesión, "Mis cursos" y reproductor de lecciones. */
(() => {
  const { esc } = NM;
  const main = document.getElementById('contenido');
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16);
  const params = new URLSearchParams(location.search);

  function login() {
    main.innerHTML = `
    <section class="banda banda-lila">
      <div class="wrap" style="max-width: 460px">
        <h1>Mi aula</h1>
        <p>Entra con el correo y la contraseña que usaste al comprar tu curso.</p>
        <form class="form" id="f-login">
          <label>Correo<input id="l-correo" type="email" autocomplete="email" required></label>
          <label>Contraseña<input id="l-clave" type="password" autocomplete="current-password" required></label>
          <p class="error" id="l-error"></p>
          <button class="btn" type="submit">Entrar</button>
          <p class="nota">¿Olvidaste tu contraseña? En la versión final llegará un enlace a tu correo para crear una nueva.</p>
          <p class="nota">¿Aún no tienes cursos? <a href="cursos-online.html">Mira los cursos online</a>.</p>
        </form>
      </div>
    </section>`;
    document.getElementById('f-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const correo = document.getElementById('l-correo').value.trim().toLowerCase();
      const u = NM.usuarios().find(x => x.correo === correo);
      if (!u || u.clave !== hash(document.getElementById('l-clave').value)) {
        document.getElementById('l-error').textContent = 'El correo o la contraseña no coinciden.';
        return;
      }
      NM.iniciarSesion(correo);
      render();
    });
  }

  const avance = (u, c) => {
    const hechas = (NM.progreso()[u.correo] || {})[c.id] || [];
    return c.lecciones.length ? Math.round(100 * hechas.filter(i => i < c.lecciones.length).length / c.lecciones.length) : 0;
  };

  // Íconos
  const ICO = {
    carpeta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    candado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };

  function misCursos(u) {
    const cursos = u.cursos.map(NM.curso).filter(Boolean);
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <div class="pie-tarjeta" style="margin-bottom: 28px; padding: 0">
          <div><h1 style="margin: 0">Hola, ${esc(u.nombre.split(' ')[0])}</h1><p class="nota" style="margin: 0">${esc(u.correo)}</p></div>
          <button class="btn btn-borde btn-chico" id="salir" type="button">Cerrar sesión</button>
        </div>
        <h2 class="hilo">Mis carpetas</h2>
        <p class="nota">Cada curso que compras tiene su carpeta exclusiva con los videos y materiales. Solo tú puedes abrirla.</p>
        ${cursos.length ? `<div class="tarjetas" style="margin-top: 24px">${cursos.map(c => {
          const p = avance(u, c);
          return `<a class="tarjeta carpeta-tarjeta" href="aula.html?curso=${encodeURIComponent(c.id)}">
            <div class="img"><img src="assets/img/${esc(c.imagen)}" alt="" loading="lazy">
              <span class="chip chip-carpeta">${ICO.carpeta} Carpeta del curso</span></div>
            <div class="cuerpo">
              <h3>${esc(c.titulo)}</h3>
              <p class="contenido-carpeta">${ICO.video} ${c.lecciones.length} videos <span>·</span> ${ICO.pdf} ${(c.materiales || []).length} materiales</p>
              <div class="barra" aria-label="Avance ${p}%"><span style="width: ${p}%"></span></div>
              <div class="pie-tarjeta"><span class="nota">${p}% completado</span><span class="flecha">${p ? 'Continuar' : 'Abrir carpeta'} </span></div>
            </div>
          </a>`;
        }).join('')}</div>` : `<p class="vacio">Todavía no tienes cursos. <a href="cursos-online.html">Ver cursos online</a></p>`}
      </div>
    </section>`;
    document.getElementById('salir').onclick = () => { NM.cerrarSesion(); history.replaceState(null, '', 'aula.html'); render(); };
  }

  function verCurso(u, c, i) {
    const prog = NM.progreso();
    const hechas = ((prog[u.correo] = prog[u.correo] || {})[c.id] = prog[u.correo][c.id] || []);
    const l = c.lecciones[i];
    const p = avance(u, c);
    const materiales = c.materiales || [];
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <nav class="ruta" aria-label="Ubicación"><a href="aula.html">Mis carpetas</a><span aria-hidden="true">/</span><span>${esc(c.titulo)}</span></nav>
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
                <span class="check" aria-hidden="true"></span><span>Clase ${j + 1}: ${esc(x.titulo)}<br><span class="nota">${ICO.video} ${esc(x.duracion || 'video')}</span></span></button></li>`).join('')}
            </ol>
            ${materiales.length ? `<div class="carpeta-titulo">${ICO.carpeta} Materiales <span>${materiales.length}</span></div>
            <ul class="archivos">${materiales.map(m => `<li><button type="button" data-material>${ICO.pdf}<span>${esc(m)}</span><span class="descargar">Descargar</span></button></li>`).join('')}</ul>` : ''}
          </aside>
          <div>
            <div class="video" role="img" aria-label="Video de la clase">
              <div><div class="play" aria-hidden="true">▶</div>
                <b>Clase ${i + 1}: ${esc(l.titulo)}</b><br>
                <span class="nota" style="color: #e6dcf5">Aquí se verá el video que Daniela suba desde su panel.</span></div>
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
            <p class="nota" id="aviso-material" hidden>En la versión final, el archivo se descarga directamente desde tu carpeta privada.</p>
            <p class="nota" style="margin-top: 20px">¿Dudas con esta clase? <a href="https://wa.me/${NM.CONTACTO.whatsapp}" target="_blank" rel="noopener">Escríbele a Daniela por WhatsApp</a>.</p>
          </div>
        </div>
      </div>
    </section>`;
    main.querySelectorAll('[data-i]').forEach(b => b.onclick = () => verCurso(u, c, Number(b.dataset.i)));
    main.querySelectorAll('[data-material]').forEach(b => b.onclick = () => { document.getElementById('aviso-material').hidden = false; });
    document.getElementById('hecha').onchange = (e) => {
      const k = hechas.indexOf(i);
      if (e.target.checked && k < 0) hechas.push(i);
      if (!e.target.checked && k >= 0) hechas.splice(k, 1);
      NM.guardarProgreso(prog);
      verCurso(u, c, i);
    };
    window.scrollTo({ top: 0, behavior: 'instant' });
  }


  function render() {
    const u = NM.usuarioActual();
    if (!u) return login();
    const id = params.get('curso');
    const c = id && u.cursos.includes(id) ? NM.curso(id) : null;
    if (c && c.lecciones.length) verCurso(u, c, 0); else misCursos(u);
  }
  render();
})();
