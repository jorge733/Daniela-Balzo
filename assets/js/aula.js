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

  function misCursos(u) {
    const cursos = u.cursos.map(NM.curso).filter(Boolean);
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <div class="pie-tarjeta" style="margin-bottom: 28px; padding: 0">
          <div><h1 style="margin: 0">Hola, ${esc(u.nombre.split(' ')[0])}</h1><p class="nota" style="margin: 0">${esc(u.correo)}</p></div>
          <button class="btn btn-borde btn-chico" id="salir" type="button">Cerrar sesión</button>
        </div>
        <h2>Mis cursos</h2>
        ${cursos.length ? `<div class="tarjetas">${cursos.map(c => {
          const p = avance(u, c);
          return `<article class="tarjeta">
            <img src="assets/img/${esc(c.imagen)}" alt="" loading="lazy">
            <div class="cuerpo">
              <h3>${esc(c.titulo)}</h3>
              <div class="barra" aria-label="Avance ${p}%"><span style="width: ${p}%"></span></div>
              <p>${p}% completado · ${c.lecciones.length} clases</p>
              <div class="pie-tarjeta"><a class="btn btn-chico" href="aula.html?curso=${encodeURIComponent(c.id)}">${p ? 'Continuar' : 'Empezar'}</a></div>
            </div>
          </article>`;
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
    main.innerHTML = `
    <section class="banda">
      <div class="wrap">
        <p><a href="aula.html">← Mis cursos</a></p>
        <h1>${esc(c.titulo)}</h1>
        <div class="barra" style="margin-bottom: 6px"><span style="width: ${p}%"></span></div>
        <p class="nota">${p}% completado</p>
        <div class="aula">
          <ol class="lecciones">
            ${c.lecciones.map((x, j) => `<li><button type="button" data-i="${j}" class="${hechas.includes(j) ? 'hecha' : ''}" ${j === i ? 'aria-current="true"' : ''}>
              <span class="check" aria-hidden="true"></span><span>Clase ${j + 1}: ${esc(x.titulo)}<br><span class="nota">${esc(x.duracion || '')}</span></span></button></li>`).join('')}
          </ol>
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
            ${(c.materiales || []).length ? `<h3 style="margin-top: 28px">Materiales para descargar</h3>
            <ul class="materiales">${c.materiales.map(m => `<li><span>${esc(m)}</span><span class="nota">Disponible en la versión final</span></li>`).join('')}</ul>` : ''}
            <p class="nota" style="margin-top: 20px">¿Dudas con esta clase? <a href="https://wa.me/${NM.CONTACTO.whatsapp}" target="_blank" rel="noopener">Escríbele a Daniela por WhatsApp</a>.</p>
          </div>
        </div>
      </div>
    </section>`;
    main.querySelectorAll('[data-i]').forEach(b => b.onclick = () => verCurso(u, c, Number(b.dataset.i)));
    document.getElementById('hecha').onchange = (e) => {
      const k = hechas.indexOf(i);
      if (e.target.checked && k < 0) hechas.push(i);
      if (!e.target.checked && k >= 0) hechas.splice(k, 1);
      NM.guardarProgreso(prog);
      verCurso(u, c, i);
    };
    window.scrollTo({ top: 0 });
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
