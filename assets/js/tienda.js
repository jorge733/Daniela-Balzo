/* Ficha de un curso online y compra simulada.
   En la versión final, el botón de pago abre el checkout de Mercado Pago y
   el acceso se activa cuando Mercado Pago confirma el pago. */
(() => {
  const { esc, clp } = NM;
  const id = new URLSearchParams(location.search).get('id');
  const curso = NM.curso(id);
  const main = document.getElementById('contenido');

  if (!curso || !curso.publicado) {
    main.innerHTML = `<section class="banda"><div class="wrap centro"><h1>Curso no encontrado</h1>
      <p>Puede que ya no esté disponible.</p><a class="btn" href="cursos-online.html">Ver cursos online</a></div></section>`;
    return;
  }
  document.title = curso.titulo + ' | Daniela Balzo · Negra Mora';

  const pintar = () => {
    const u = NM.usuarioActual();
    const tiene = u && u.cursos.includes(curso.id);
    main.innerHTML = `
    <section class="banda banda-lila">
      <div class="wrap dos">
        <div>
          <span class="etiqueta">Curso online · ${curso.lecciones.length} clases en video</span>
          <h1>${esc(curso.titulo)}</h1>
          <p>${esc(curso.resumen)}</p>
          <div class="pie-tarjeta" style="justify-content: flex-start; gap: 20px">
            <span class="precio" style="font-size: 2rem">${tiene ? 'Ya es tuyo' : clp(curso.precio)}</span>
            ${tiene
              ? `<a class="btn" href="aula.html?curso=${encodeURIComponent(curso.id)}">Ir a mi aula</a>`
              : `<button class="btn" id="comprar" type="button">Comprar curso</button>`}
          </div>
          <p class="nota" style="margin-top: 12px">Pago único. Acceso a los videos y materiales cuando quieras.</p>
        </div>
        <img class="foto" src="assets/img/${esc(curso.imagen)}" alt="">
      </div>
    </section>
    <section class="banda">
      <div class="wrap dos" style="align-items: start">
        <div>
          <h2>Qué vas a aprender</h2>
          <ol class="linea-tiempo">
            ${curso.lecciones.map((l, i) => `<li><b>Clase ${i + 1}</b><span>${esc(l.titulo)} <span class="nota">· ${esc(l.duracion || '')}</span></span></li>`).join('')}
          </ol>
        </div>
        <div class="ficha">
          <h3>Incluye</h3>
          <ul>
            <li>${curso.lecciones.length} clases en video para ver cuando quieras</li>
            ${(curso.materiales || []).map(m => `<li>${esc(m)}</li>`).join('')}
            <li>Consultas por WhatsApp mientras haces el curso</li>
          </ul>
          <h3 style="margin-top: 18px">Necesitas</h3>
          <p>Una máquina de coser que funcione y materiales básicos de costura. ¿No sabes qué comprar? <a href="contacto.html">Escríbeme</a>.</p>
        </div>
      </div>
    </section>`;
    const b = document.getElementById('comprar');
    if (b) b.addEventListener('click', abrir);
  };

  // ---------- Compra ----------
  const modal = document.getElementById('modal');
  const $ = (x) => document.getElementById(x);
  // Solo para el prototipo: no guarda la contraseña en texto plano.
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16);

  function abrir() {
    const u = NM.usuarioActual();
    $('m-curso').textContent = curso.titulo;
    $('m-precio').textContent = clp(curso.precio);
    $('campos-cuenta').hidden = !!u;
    $('campos-cuenta').querySelectorAll('input').forEach(i => i.required = !u);
    $('m-ya-cuenta').textContent = u ? `Comprarás con tu cuenta ${u.correo}.` : '';
    $('m-error').textContent = '';
    $('paso-cuenta').hidden = false;
    $('paso-pagando').hidden = true;
    $('paso-listo').hidden = true;
    modal.hidden = false;
    (u ? modal.querySelector('.mp') : $('m-nombre')).focus();
  }
  const cerrar = () => { modal.hidden = true; pintar(); };
  modal.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = cerrar);
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  $('paso-cuenta').addEventListener('submit', (e) => {
    e.preventDefault();
    let u = NM.usuarioActual();
    const usuarios = NM.usuarios();
    if (!u) {
      const correo = $('m-correo').value.trim().toLowerCase();
      const existente = usuarios.find(x => x.correo === correo);
      if (existente && existente.clave !== hash($('m-clave').value)) {
        $('m-error').textContent = 'Ese correo ya tiene cuenta y la contraseña no coincide. Entra desde "Mi aula" o usa otro correo.';
        return;
      }
      u = existente || { nombre: $('m-nombre').value.trim(), correo, clave: hash($('m-clave').value), cursos: [], creado: Date.now() };
      if (!existente) usuarios.push(u);
    }
    // Simula el paso por Mercado Pago
    $('paso-cuenta').hidden = true;
    $('paso-pagando').hidden = false;
    let p = 0;
    const timer = setInterval(() => {
      p += 20;
      $('m-barra').style.width = p + '%';
      if (p < 100) return;
      clearInterval(timer);
      const yo = usuarios.find(x => x.correo === u.correo);
      if (!yo.cursos.includes(curso.id)) yo.cursos.push(curso.id);
      NM.guardarUsuarios(usuarios);
      const ventas = NM.ventas();
      ventas.unshift({ fecha: Date.now(), correo: yo.correo, nombre: yo.nombre, curso: curso.id, titulo: curso.titulo, monto: curso.precio });
      NM.guardarVentas(ventas);
      NM.iniciarSesion(yo.correo);
      $('m-ir').href = 'aula.html?curso=' + encodeURIComponent(curso.id);
      $('paso-pagando').hidden = true;
      $('paso-listo').hidden = false;
      $('m-ir').focus();
    }, 250);
  });

  pintar();
})();
