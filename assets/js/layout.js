/* Barra superior, menú, pie de página y botón de WhatsApp comunes a todas las páginas. */
(() => {
  const pagina = document.body.dataset.pagina || '';
  const t = NM.textos();
  const { CONTACTO, esc } = NM;

  const enlace = (href, texto, clave, extra = '') =>
    `<a href="${href}"${clave === pagina ? ' aria-current="page"' : ''}${extra}>${texto}</a>`;

  const marca = `
    <a class="marca-mini" href="index.html">
      <img src="assets/img/logo-01.jpg" alt="">
      <span><strong>${esc(t.nombre)}</strong><small>Negra Mora · Clases de costura</small></span>
    </a>`;

  const barra = `
  <header class="topbar">
    <div class="wrap">
      ${marca}
      <nav class="menu" aria-label="Menú principal">
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-items" aria-label="Abrir menú">
          <span class="hamb" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
        <div class="menu-fondo" aria-hidden="true"></div>
        <div class="items" id="menu-items">
          <div class="menu-cabeza">
            <span>Menú</span>
            <button class="menu-cerrar" type="button" aria-label="Cerrar menú">×</button>
          </div>
          ${enlace('index.html', 'Inicio', 'inicio')}
          <details><summary>Quién soy</summary><div>
            ${enlace('quien-soy.html', 'Quién soy', 'quien-soy')}
            ${enlace('talleres.html', 'Talleres realizados', 'talleres')}
          </div></details>
          <details><summary>Cursos</summary><div>
            ${enlace('cursos.html', 'Todos los cursos', 'cursos')}
            ${enlace('clases-grupales.html', 'Clases grupales en el taller', 'clases-grupales')}
            ${enlace('clases-domicilio.html', 'Clases a domicilio', 'clases-domicilio')}
            ${enlace('clases-online.html', 'Clases online en vivo', 'clases-online')}
          </div></details>
          <details><summary>Portafolio</summary><div>
            ${enlace('vestuario.html', 'Vestuario', 'vestuario')}
            ${enlace('accesorios.html', 'Accesorios', 'accesorios')}
            ${enlace('ilustracion-textil.html', 'Ilustración textil', 'ilustracion-textil')}
            ${enlace('arte-terapia.html', 'Arte terapia', 'arte-terapia')}
          </div></details>
          ${enlace('contacto.html', 'Contacto', 'contacto')}
          ${enlace('aula.html', 'Mi aula', 'aula')}
          ${enlace('cursos-online.html', 'Cursos online', 'cursos-online', ' class="destacado"')}
          <div class="menu-pie">
            <a class="btn btn-rosa" href="https://wa.me/${CONTACTO.whatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>
            <p><a href="mailto:${esc(CONTACTO.correo)}">${esc(CONTACTO.correo)}</a><br>
            <a href="https://instagram.com/${esc(CONTACTO.instagram)}" target="_blank" rel="noopener">Instagram @${esc(CONTACTO.instagram)}</a></p>
          </div>
        </div>
      </nav>
    </div>
  </header>`;

  const pie = `
  <footer class="pie">
    <div class="wrap">
      <div class="cols">
        <div>
          ${marca}
          <p>${esc(t.linea1)}.<br>${esc(t.linea2)}.</p>
        </div>
        <div>
          <h4>El sitio</h4>
          <ul>
            <li><a href="cursos.html">Cursos presenciales</a></li>
            <li><a href="cursos-online.html">Cursos online</a></li>
            <li><a href="vestuario.html">Portafolio</a></li>
            <li><a href="talleres.html">Talleres realizados</a></li>
            <li><a href="aula.html">Mi aula</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li><a href="mailto:${esc(CONTACTO.correo)}">${esc(CONTACTO.correo)}</a></li>
            <li><a href="https://wa.me/${CONTACTO.whatsapp}" target="_blank" rel="noopener">${esc(CONTACTO.telefono)}</a></li>
            <li><a href="https://instagram.com/${esc(CONTACTO.instagram)}" target="_blank" rel="noopener">Instagram @${esc(CONTACTO.instagram)}</a></li>
            <li>La Reina, metro Francisco Bilbao</li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <span>© ${new Date().getFullYear()} Daniela Balzo · Negra Mora Diseños · <span class="sello-prototipo">Prototipo</span> desarrollado por <a href="https://benedettowebs.vercel.app" target="_blank" rel="noopener">BenedettoWebs</a></span>
        <a href="panel.html">Panel de administración</a>
      </div>
    </div>
  </footer>
  <a class="whatsapp" href="https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent('Hola Daniela, vi tu página y quiero información sobre las clases de costura.')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 1.9 6.8L3 29l6.8-2.1c1.9 1 4 1.6 6.2 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.5 9.9 10.2 5.3 16 5.3s10.5 4.6 10.5 10.4S21.8 26.2 16 26.2zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>
  </a>`;

  let ocultarBanner = false;
  try { ocultarBanner = sessionStorage.getItem('nm_banner') === 'no'; } catch (e) {}
  const banner = ocultarBanner ? '' : `
  <div class="banner-prototipo" role="note">
    <b>Prototipo</b> Esta es una versión de prueba del nuevo sitio de Daniela Balzo. Los pagos, las cuentas y los cursos online son de ejemplo.
    <button type="button" aria-label="Ocultar aviso">×</button>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', banner + barra);
  const cerrarBanner = document.querySelector('.banner-prototipo button');
  if (cerrarBanner) cerrarBanner.onclick = () => {
    cerrarBanner.parentElement.remove();
    try { sessionStorage.setItem('nm_banner', 'no'); } catch (e) {}
  };
  document.body.insertAdjacentHTML('beforeend', pie);

  const menu = document.querySelector('.menu');
  const boton = menu.querySelector('.menu-toggle');
  const submenus = menu.querySelectorAll('details');

  // Menú móvil: panel lateral con fondo oscuro
  const abrirMenu = (abrir) => {
    menu.classList.toggle('abierto', abrir);
    document.documentElement.classList.toggle('menu-abierto', abrir);
    boton.setAttribute('aria-expanded', abrir);
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    if (abrir) {
      // Deja abierta la sección de la página actual
      submenus.forEach(d => { d.open = !!d.querySelector('[aria-current="page"]'); });
      setTimeout(() => menu.querySelector('.menu-cerrar').focus(), 60);
    } else {
      boton.focus();
    }
  };
  boton.addEventListener('click', () => abrirMenu(!menu.classList.contains('abierto')));
  menu.querySelector('.menu-cerrar').addEventListener('click', () => abrirMenu(false));
  menu.querySelector('.menu-fondo').addEventListener('click', () => abrirMenu(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('abierto')) abrirMenu(false);
  });
  menu.querySelectorAll('.items a').forEach(a => a.addEventListener('click', () => {
    if (menu.classList.contains('abierto')) abrirMenu(false);
  }));
  // Si se agranda la ventana con el menú abierto, se cierra
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (m) => {
    if (m.matches && menu.classList.contains('abierto')) abrirMenu(false);
  });

  // Un solo submenú abierto a la vez; en escritorio se cierran al hacer clic fuera
  submenus.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) submenus.forEach(o => { if (o !== d) o.open = false; });
  }));
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('abierto')) return;
    submenus.forEach(d => { if (d.open && !d.contains(e.target)) d.open = false; });
  });

  // ---------- Animaciones ----------
  // Sin JavaScript o con "reducir movimiento" activado, todo se ve sin animar.
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinMovimiento || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('anim');

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add(en.target.classList.contains('hilo') ? 'cosido' : 'visible');
      observador.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  // Se espera a que terminen los demás scripts para incluir lo que pintan (galerías, cursos).
  const preparar = () => {
    const grupos = ['.tarjetas > *', '.galeria > button', '.instituciones > li', '.linea-tiempo > li', '.fotos-3 > img'];
    grupos.forEach(sel => document.querySelectorAll('main ' + sel).forEach(el => {
      const hermanos = [...el.parentElement.children];
      el.style.setProperty('--retraso', (hermanos.indexOf(el) % 4) * 90 + 'ms');
      el.classList.add('revelar');
    }));
    document.querySelectorAll('main .encabezado-seccion, main .dos > *, main .grupo-taller > h3, main .banda > .wrap > .botones, main .banda-morada .wrap')
      .forEach(el => { if (!el.closest('.revelar')) el.classList.add('revelar'); });
    document.querySelectorAll('.hilo').forEach(el => el.classList.add('coser'));
    document.querySelectorAll('main .revelar, .hilo').forEach(el => observador.observe(el));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", preparar); else preparar();
})();
