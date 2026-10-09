/* Encabezado, menú, pie de página y botón de WhatsApp comunes a todas las páginas. */
(() => {
  const pagina = document.body.dataset.pagina || '';
  const t = NM.textos();
  const { CONTACTO, esc } = NM;

  const enlace = (href, texto, clave, extra = '') =>
    `<a href="${href}"${clave === pagina ? ' aria-current="page"' : ''}${extra}>${texto}</a>`;

  const encabezado = `
  <header class="encabezado">
    <div class="wrap">
      <a class="logo" href="index.html" aria-label="Inicio"><img src="assets/img/logo-01.jpg" alt="Logo Negra Mora"></a>
      <a class="marca" href="index.html">
        <strong>${esc(t.nombre)}</strong>
        <span>${esc(t.linea1)}</span>
        <span>${esc(t.linea2)}</span>
      </a>
      <div class="relleno"></div>
    </div>
  </header>
  <nav class="menu" aria-label="Menú principal">
    <div class="wrap">
      <button class="menu-toggle" type="button" aria-expanded="false">☰ Menú</button>
      <div class="items">
        ${enlace('index.html', 'Inicio', 'inicio')}
        <details><summary>Quién soy</summary><div>
          ${enlace('quien-soy.html', 'Quién soy', 'quien-soy')}
          ${enlace('talleres.html', 'Talleres realizados', 'talleres')}
        </div></details>
        <details><summary>Cursos disponibles</summary><div>
          ${enlace('cursos.html', 'Todos los cursos', 'cursos')}
          ${enlace('clases-online.html', 'Clases online', 'clases-online')}
          ${enlace('clases-grupales.html', 'Clases grupales personalizadas', 'clases-grupales')}
          ${enlace('clases-domicilio.html', 'Clases a domicilio', 'clases-domicilio')}
        </div></details>
        <details><summary>Portafolio</summary><div>
          ${enlace('vestuario.html', 'Vestuario', 'vestuario')}
          ${enlace('accesorios.html', 'Accesorios', 'accesorios')}
          ${enlace('ilustracion-textil.html', 'Ilustración textil', 'ilustracion-textil')}
          ${enlace('arte-terapia.html', 'Arte terapia', 'arte-terapia')}
        </div></details>
        ${enlace('contacto.html', 'Contacto', 'contacto')}
        ${enlace('cursos-online.html', 'Cursos online', 'cursos-online', ' class="destacado"')}
        ${enlace('aula.html', 'Mi aula', 'aula')}
      </div>
    </div>
  </nav>`;

  const pie = `
  <footer class="pie">
    <div class="wrap">
      <nav aria-label="Menú del pie">
        <a href="index.html">Inicio</a>
        <a href="cursos.html">Cursos disponibles</a>
        <a href="cursos-online.html">Cursos online</a>
        <a href="contacto.html">Contacto</a>
        <a href="vestuario.html">Portafolio</a>
        <a href="panel.html">Panel</a>
      </nav>
      <p>© ${new Date().getFullYear()} Daniela Balzo · Negra Mora Diseños · ${esc(CONTACTO.correo)} · Instagram @${esc(CONTACTO.instagram)}</p>
    </div>
  </footer>
  <a class="whatsapp" href="https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent('Hola Daniela, vi tu página y quiero información sobre las clases de costura.')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 1.9 6.8L3 29l6.8-2.1c1.9 1 4 1.6 6.2 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.5 9.9 10.2 5.3 16 5.3s10.5 4.6 10.5 10.4S21.8 26.2 16 26.2zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>
  </a>`;

  document.body.insertAdjacentHTML('afterbegin', encabezado);
  document.body.insertAdjacentHTML('beforeend', pie);

  const menu = document.querySelector('.menu');
  const boton = menu.querySelector('.menu-toggle');
  boton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', abierto);
  });
  // Cierra los submenús al hacer clic fuera (escritorio)
  document.addEventListener('click', (e) => {
    menu.querySelectorAll('details[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });
})();
