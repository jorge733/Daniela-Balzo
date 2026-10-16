/* Barra superior, menú, pie de página y botón de WhatsApp comunes a todas las páginas. */
(() => {
  const pagina = document.body.dataset.pagina || '';
  const t = NM.textos();
  const { CONTACTO, esc } = NM;

  const enlace = (href, texto, clave, extra = '') =>
    `<a href="${href}"${clave === pagina ? ' aria-current="page"' : ''}${extra}>${texto}</a>`;

  const instagram = `<a class="marca-ig" href="https://instagram.com/${esc(CONTACTO.instagram)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>@${esc(CONTACTO.instagram)}</a>`;

  const marca = `
    <a class="marca-mini" href="./">
      <img src="assets/img/logo-icono.jpg" alt="">
      <span><strong data-texto="nombre">${esc(t.nombre)}</strong><small data-texto="marca">${esc(t.marca)}</small></span>
    </a>`;

  const barra = `
  <header class="topbar">
    <div class="wrap">
      <div class="marca-bloque">${marca}${instagram}</div>
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
          ${enlace('./', 'Inicio', 'inicio')}
          <details data-ir="quien-soy"><summary>Quién soy</summary><div>
            ${enlace('quien-soy', 'Quién soy', 'quien-soy')}
            ${enlace('talleres', 'Talleres realizados', 'talleres')}
          </div></details>
          <details data-ir="cursos"><summary>Cursos</summary><div>
            ${enlace('cursos', 'Todos los cursos', 'cursos')}
            ${enlace('cursos-online', 'Cursos online', 'cursos-online')}
          </div></details>
          ${enlace('patrones', 'Patrones', 'patrones')}
          <details data-ir="vestuario"><summary>Portafolio</summary><div>
            ${enlace('vestuario', 'Vestuario', 'vestuario')}
            ${enlace('accesorios', 'Accesorios', 'accesorios')}
            ${enlace('ilustracion-textil', 'Ilustración textil', 'ilustracion-textil')}
            ${enlace('arte-terapia', 'Arte terapia', 'arte-terapia')}
          </div></details>
          ${enlace('contacto', 'Contacto', 'contacto')}
          ${enlace('aula', 'Mis cursos', 'aula')}
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
          <p><span data-texto="linea1">${esc(t.linea1)}</span>.<br><span data-texto="linea2">${esc(t.linea2)}</span>.</p>
        </div>
        <div>
          <h4>El sitio</h4>
          <ul>
            <li><a href="cursos">Cursos presenciales</a></li>
            <li><a href="cursos-online">Cursos online</a></li>
            <li><a href="patrones">Patrones</a></li>
            <li><a href="vestuario">Portafolio</a></li>
            <li><a href="talleres">Talleres realizados</a></li>
            <li><a href="aula">Mis cursos</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li><a href="mailto:${esc(CONTACTO.correo)}">${esc(CONTACTO.correo)}</a></li>
            <li><a href="https://wa.me/${CONTACTO.whatsapp}" target="_blank" rel="noopener">${esc(CONTACTO.telefono)}</a></li>
            <li><a href="https://instagram.com/${esc(CONTACTO.instagram)}" target="_blank" rel="noopener">Instagram @${esc(CONTACTO.instagram)}</a></li>
            <li data-texto="direccion">${esc(t.direccion)}</li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <span>© ${new Date().getFullYear()} Daniela Balzo · Negra Mora Diseños · ${NM.MODO_PRUEBA ? '<span class="sello-prototipo">Sitio en construcción</span> ' : ''}Desarrollado por <a href="https://benedettowebs.vercel.app" target="_blank" rel="noopener">BenedettoWebs</a></span>
        <span class="legal-links"><a href="terminos">Términos y condiciones</a> · <a href="privacidad">Privacidad</a> · <a href="panel">Panel</a></span>
      </div>
    </div>
  </footer>
  <a class="whatsapp" href="https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent('Hola Daniela, vi tu página y quiero información sobre las clases de costura.')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 1.9 6.8L3 29l6.8-2.1c1.9 1 4 1.6 6.2 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.5 9.9 10.2 5.3 16 5.3s10.5 4.6 10.5 10.4S21.8 26.2 16 26.2zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>
  </a>`;

  let ocultarBanner = false;
  try { ocultarBanner = sessionStorage.getItem('nm_banner') === 'no'; } catch (e) {}
  const banner = ocultarBanner || !NM.MODO_PRUEBA ? '' : `
  <div class="banner-prototipo" role="note">
    <b>Sitio en construcción</b> Estamos terminando el nuevo sitio de Daniela Balzo, así que algunas secciones pueden cambiar.
    <button type="button" aria-label="Ocultar aviso">×</button>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', banner + barra);
  const cerrarBanner = document.querySelector('.banner-prototipo button');
  if (cerrarBanner) cerrarBanner.onclick = () => {
    cerrarBanner.parentElement.remove();
    try { sessionStorage.setItem('nm_banner', 'no'); } catch (e) {}
  };
  document.body.insertAdjacentHTML('beforeend', pie);

  // ---------- Textos editables desde el panel ----------
  // Se leen con la API REST de Firestore (sin cargar Firebase en cada página) y se guardan
  // por sesión para que no parpadeen al cambiar de página.
  NM.prepararTextos();
  import(new URL('config.js', document.currentScript.src)).then(async ({ FIREBASE, EMULADORES }) => {
    const base = EMULADORES ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
    const r = await fetch(`${base}/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/sitio/textos`);
    if (!r.ok) return;
    const campos = (await r.json()).fields || {};
    const txt = {};
    Object.keys(campos).forEach(k => { if (campos[k].stringValue) txt[k] = campos[k].stringValue; });
    NM.actualizarTextos(txt);
  }).catch(() => {});

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

  // En computador, los submenús se abren al pasar el mouse (con una pequeña espera al salir
  // para que no se cierren si el mouse se desvía un poco). En celular siguen abriéndose con un toque.
  const conMouse = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1081px)');
  submenus.forEach(d => {
    let cerrar;
    d.addEventListener('mouseenter', () => {
      if (!conMouse.matches) return;
      clearTimeout(cerrar);
      d.open = true;
    });
    d.addEventListener('mouseleave', () => {
      if (!conMouse.matches) return;
      cerrar = setTimeout(() => { d.open = false; }, 250);
    });
    // Ya abierto por el mouse, un clic en el título no lo cierra; si la sección tiene página propia
    // (Quién soy, Cursos, Portafolio), el clic lleva a ella
    d.querySelector('summary').addEventListener('click', (e) => {
      if (!conMouse.matches || e.detail === 0) return; // con teclado (detail 0) sí se abre y cierra
      if (d.dataset.ir) { e.preventDefault(); location.href = d.dataset.ir; return; }
      if (d.open) e.preventDefault();
    });
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
