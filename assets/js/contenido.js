/* Clases presenciales y talleres realizados, editables desde el panel.
   Los valores originales están en datos.js; lo que Daniela guarda vive en Firestore
   (sitio/presenciales y sitio/talleres) y se lee con la API REST, igual que los textos. */

const NMC = (() => {
  const { esc, clp } = NM;

  const { PRESENCIALES, TALLERES } = NM;

  // ---------- Datos guardados ----------
  const leerCache = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  let presenciales = leerCache('nm_presenciales') || PRESENCIALES;
  let talleres = leerCache('nm_talleres') || TALLERES;
  let cargado = false;

  // ---------- Utilidades ----------
  /** Foto del sitio ("cursos-02.jpg") o subida desde el panel (https://…). */
  const foto = (f) => /^https?:/.test(f || '') ? f : 'assets/img/' + (f || 'cursos-05.jpg');
  /** Texto con *negritas*, ya escapado. */
  const fmt = (s) => esc(s).replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  const parrafos = (s) => String(s || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const lineas = (s) => String(s || '').split('\n').map(l => l.trim()).filter(Boolean);
  /** Dirección de la página de una clase: las originales tienen la suya. */
  const enlace = (c) => c.pagina || 'clase?id=' + encodeURIComponent(c.id);
  const whatsapp = (texto) => `https://wa.me/${NM.CONTACTO.whatsapp}?text=${encodeURIComponent(texto || 'Hola Daniela, quiero información sobre las clases.')}`;
  const visibles = () => presenciales.filter(c => c.visible !== false);
  const pagoFallido = new URLSearchParams(location.search).get('pago') === 'error';
  const precio = (c) => c.precio ? clp(c.precio) : 'A convenir';

  // ---------- Pintar ----------
  const tarjetaInicio = (c) => `
    <a class="tarjeta" href="${esc(enlace(c))}">
      <div class="img"><img src="${esc(foto(c.imagen))}" alt="" loading="lazy">${c.modalidad ? `<span class="chip">${esc(c.modalidad)}</span>` : ''}</div>
      <div class="cuerpo">
        ${c.duracion ? `<span class="duracion">${esc(c.duracion)}</span>` : ''}
        <h3>${esc(c.titulo)}</h3>
        <p>${fmt(c.resumen)}</p>
        <div class="pie-tarjeta"><span class="precio">${precio(c)}${c.precio && c.unidad ? ` <small>/ ${esc(c.unidad)}</small>` : ''}</span><span class="flecha">Ver más </span></div>
      </div>
    </a>`;

  const tarjetaCursos = (c) => `
    <article class="tarjeta">
      <img src="${esc(foto(c.imagen))}" alt="" loading="lazy">
      <div class="cuerpo">
        ${c.modalidad ? `<span class="modalidad">${esc(c.modalidad)}</span>` : ''}
        <h3>${esc(c.titulo)}</h3>
        <p>${fmt(c.resumen)}</p>
        <div class="pie-tarjeta"><a class="btn btn-chico" href="${esc(enlace(c))}">Ver más</a></div>
      </div>
    </article>`;

  // Tarjeta fija de los cursos en video, al final de la página de cursos (sus textos se cambian en el panel)
  const TARJETA_VIDEO = `
    <article class="tarjeta">
      <img src="assets/img/cursos-05.jpg" alt="" loading="lazy" data-texto="cursos_videoFoto" data-tipo="foto">
      <div class="cuerpo">
        <span class="modalidad" data-texto="cursos_videoEtiqueta">Online en video</span>
        <h3 data-texto="cursos_videoTitulo">Cursos online en video</h3>
        <p data-texto="cursos_videoTexto">Aprende a tu ritmo, desde tu casa: uso y manejo de máquina, ropa interior, bolsos y más. Compras el curso una vez y ves las clases cuando quieras.</p>
        <div class="pie-tarjeta"><a class="btn btn-chico" href="cursos-online">Ver cursos en video</a></div>
      </div>
    </article>`;

  const fichaClase = (c) => {
    // Las 3 primeras fotos van arriba de la descripción; las demás, en una galería al final
    const fotos = (c.fotos || []).slice(0, 3);
    const masFotos = (c.fotos || []).slice(3);
    const datos = lineas(c.datos).map(l => {
      const i = l.indexOf(':');
      return i > 0 && i < 30 ? `<li><b>${esc(l.slice(0, i + 1))}</b>${fmt(l.slice(i + 1))}</li>` : `<li>${fmt(l)}</li>`;
    }).join('');
    const recuadros = (c.recuadros || []).filter(r => r.titulo || r.texto);
    return `
    <header class="cabeza">
      <div class="wrap">
        ${c.modalidad ? `<span class="etiqueta">${esc(c.modalidad)}</span>` : ''}
        <h1 class="hilo">${esc(c.titulo)}</h1>
        ${c.bajada ? `<p>${fmt(c.bajada)}</p>` : ''}
      </div>
    </header>

    <section class="banda">
      <div class="wrap dos">
        <div>
          ${fotos.length ? `<div class="fotos-3 fotos-arriba">${fotos.map((f, i) => `<img src="${esc(foto(f))}" alt="${esc(c.titulo)}, foto ${i + 1}">`).join('')}</div>` : ''}
          ${parrafos(c.descripcion).map(p => `<p>${fmt(p).replace(/\n/g, '<br>')}</p>`).join('')}
          ${c.puntosTitulo ? `<h3>${esc(c.puntosTitulo)}</h3>` : ''}
          ${lineas(c.puntos).length ? `<ul class="lista-check">${lineas(c.puntos).map(l => `<li>${fmt(l)}</li>`).join('')}</ul>` : ''}
        </div>
        <div class="ficha">
          <div class="precio-grande">${precio(c)}</div>
          ${c.duracion || c.unidad ? `<p>${esc([c.precio && c.unidad ? '1 ' + c.unidad : '', c.duracion].filter(Boolean).join(' · '))}</p>` : ''}
          ${datos ? `<ul class="lista-check">${datos}</ul>` : ''}
          <h3 style="margin-top: 18px">¿Cómo inscribirme?</h3>
          ${c.inscripcion ? `<p>${fmt(c.inscripcion)}</p>` : ''}
          ${pagoFallido ? '<p class="error">El pago no se completó. No se cobró nada; puedes intentarlo otra vez.</p>' : ''}
          <div class="botones">
            ${c.precio ? `<button class="btn mp" type="button" data-pagar-clase="${esc(c.id)}">Pagar e inscribirme</button>
            <a class="btn btn-borde" href="${esc(whatsapp(c.whatsapp))}" target="_blank" rel="noopener">Consultar por WhatsApp</a>`
            : `<a class="btn" href="${esc(whatsapp(c.whatsapp))}" target="_blank" rel="noopener">Inscribirme por WhatsApp</a>
            <a class="btn btn-borde" href="mailto:${esc(NM.CONTACTO.correo)}">Enviar correo</a>`}
          </div>
          ${c.precio ? '<p class="nota" style="margin-top: 10px">Pago seguro con Mercado Pago: tarjeta de crédito, débito o prepago.</p>' : ''}
        </div>
      </div>
    </section>

    ${recuadros.length ? `<section class="banda banda-suave">
      <div class="wrap">
        <div class="tarjetas">${recuadros.map(r => `
          <article class="tarjeta">
            ${r.imagen ? `<img src="${esc(foto(r.imagen))}" alt="" loading="lazy">` : ''}
            <div class="cuerpo">
              ${r.titulo ? `<h3>${esc(r.titulo)}</h3>` : ''}
              ${parrafos(r.texto).map(p => `<p>${fmt(p)}</p>`).join('')}
            </div>
          </article>`).join('')}
        </div>
      </div>
    </section>` : ''}

    ${masFotos.length ? `<section class="banda">
      <div class="wrap">
        <div class="encabezado-seccion centro"><h2 class="hilo">Más fotos</h2></div>
        <div class="galeria${masFotos.length < 4 ? ' galeria-pocas' : ''}" style="--n: ${masFotos.length}" data-galeria="propia">${masFotos.map((f, i) =>
          `<button type="button" data-src="${esc(foto(f))}"><img src="${esc(foto(f))}" alt="${esc(c.titulo)}, foto ${i + 4}" loading="lazy"></button>`).join('')}</div>
      </div>
    </section>` : ''}`;
  };

  const NO_DISPONIBLE = `
    <header class="cabeza"><div class="wrap"><h1>Esta clase no está disponible</h1><p>Puede que ya no se esté dictando. Revisa los otros cursos.</p></div></header>
    <section class="banda centro"><div class="wrap"><a class="btn" href="cursos">Ver todos los cursos</a></div></section>`;

  const grupoTaller = (t) => {
    const fotos = t.fotos || [];
    return `
    <div class="grupo-taller">
      <div class="texto-taller">
        <h3>${t.anios ? `<small>${esc(t.anios)}</small>` : ''}${esc(t.titulo)}</h3>
        ${parrafos(t.texto).map(p => `<p>${fmt(p)}</p>`).join('')}
      </div>
      <div class="galeria${fotos.length === 4 ? ' galeria-2' : ''}" data-galeria="propia">${fotos.map((f, i) =>
        `<button type="button" data-src="${esc(foto(f))}"><img src="${esc(foto(f))}" alt="${esc(t.titulo)}, foto ${i + 1}" loading="lazy"></button>`).join('')}</div>
    </div>`;
  };

  // Solo se vuelve a dibujar si cambió algo, para no recargar las fotos.
  const poner = (el, html) => { if (el.dataset.pintado !== html) { el.innerHTML = html; el.dataset.pintado = html; NM.ponerTextos(el); } };

  function pintar() {
    document.querySelectorAll('[data-presenciales="inicio"]').forEach(el => poner(el, visibles().map(tarjetaInicio).join('')));
    document.querySelectorAll('[data-presenciales="cursos"]').forEach(el => poner(el, visibles().map(tarjetaCursos).join('') + TARJETA_VIDEO));
    document.querySelectorAll('[data-presencial]').forEach(el => {
      const id = el.dataset.presencial || new URLSearchParams(location.search).get('id');
      const c = presenciales.find(x => x.id === id);
      // Una clase nueva puede no estar todavía en lo guardado de esta visita: se espera a Firestore.
      if (!c && !cargado) return poner(el, '<section class="banda"><div class="wrap"><p class="vacio">Cargando…</p></div></section>');
      poner(el, c && c.visible !== false ? fichaClase(c) : NO_DISPONIBLE);
      if (c && el.dataset.presencial === '') document.title = `${c.titulo} | Daniela Balzo · Negra Mora`;
    });
    document.querySelectorAll('[data-talleres]').forEach(el => poner(el, talleres.map(grupoTaller).join('')));
    pintarMenu();
  }

  // Submenú "Cursos" del encabezado: una entrada por cada clase presencial visible
  function pintarMenu() {
    const caja = document.querySelector('.menu details[data-ir="cursos"] > div');
    if (!caja) return;
    caja.querySelectorAll('[data-menu-clase]').forEach(a => a.remove());
    const actual = document.body.dataset.pagina === 'clase' ? 'clase?id=' + encodeURIComponent(new URLSearchParams(location.search).get('id') || '') : document.body.dataset.pagina;
    caja.insertAdjacentHTML('beforeend', visibles().map(c =>
      `<a href="${esc(enlace(c))}" data-menu-clase${enlace(c) === actual ? ' aria-current="page"' : ''}>${esc(c.titulo)}</a>`).join(''));
  }

  // ---------- Pago de una clase presencial ----------
  // No pide cuenta: nombre, correo y teléfono para que Daniela coordine. El precio lo pone el servidor.
  function abrirPago(c) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'pago-titulo');
    m.innerHTML = `<div class="caja">
      <h2 id="pago-titulo">Inscribirme</h2>
      <div class="resumen"><span>${esc(c.titulo)}</span><span>${precio(c)}</span></div>
      <form class="form" id="f-pago-clase">
        <label>Tu nombre<input name="nombre" autocomplete="name" maxlength="100" required></label>
        <label>Tu correo<input name="correo" type="email" autocomplete="email" maxlength="150" required></label>
        <label>Tu WhatsApp<input name="telefono" type="tel" autocomplete="tel" maxlength="30" placeholder="+56 9 1234 5678" required></label>
        <label>¿Qué horario prefieres? ¿Algo que Daniela deba saber? <small>(opcional)</small>
          <textarea name="nota" rows="3" maxlength="500" placeholder="Ej: prefiero los sábados. Quiero hacer un vestido."></textarea></label>
        <p class="nota">Después de pagar, Daniela te escribe para coordinar el horario.</p>
        <p class="error" role="alert"></p>
        <button class="btn mp" type="submit">Pagar con Mercado Pago</button>
        <button class="btn btn-borde" type="button" data-cerrar>Cancelar</button>
      </form>
    </div>`;
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', tecla); };
    const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-cerrar]')) cerrar(); });
    document.addEventListener('keydown', tecla);
    const f = m.querySelector('form');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const boton = f.querySelector('.mp');
      const err = f.querySelector('.error');
      boton.disabled = true;
      boton.textContent = 'Te llevamos a Mercado Pago…';
      err.textContent = '';
      try {
        const r = await fetch('/api/crear-pago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clase: c.id, ...Object.fromEntries(new FormData(f)) })
        });
        const datos = await r.json().catch(() => ({}));
        if (!r.ok || !datos.url) throw new Error(datos.error || 'No pudimos conectar con Mercado Pago. Intenta de nuevo.');
        location.href = datos.url;
      } catch (x) {
        err.textContent = x.message || 'No pudimos conectar con Mercado Pago. Intenta de nuevo.';
        boton.disabled = false;
        boton.textContent = 'Pagar con Mercado Pago';
      }
    });
    document.body.append(m);
    f.nombre.focus();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pagar-clase]');
    if (!b) return;
    const c = presenciales.find(x => x.id === b.dataset.pagarClase);
    if (c) abrirPago(c);
  });

  // ---------- Lectura desde Firestore (API REST, sin cargar Firebase) ----------
  function valor(v) {
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(valor);
    if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, valor(x)]));
    return null;
  }
  const script = document.currentScript;
  async function cargar() {
    const { FIREBASE, EMULADORES } = await import(new URL('config.js', script.src));
    const base = (EMULADORES ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com') +
      `/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/sitio/`;
    const leer = async (nombre) => {
      const r = await fetch(base + nombre);
      if (!r.ok) return null;
      const lista = (await r.json()).fields?.lista;
      return lista ? valor(lista) : null;
    };
    const quiereTalleres = !!document.querySelector('[data-talleres]');
    const [p, t] = await Promise.all([leer('presenciales'), quiereTalleres ? leer('talleres') : null]);
    if (p) { presenciales = p; try { sessionStorage.setItem('nm_presenciales', JSON.stringify(p)); } catch (e) {} }
    cargado = true;
    if (t) { talleres = t; try { sessionStorage.setItem('nm_talleres', JSON.stringify(t)); } catch (e) {} }
    pintar();
  }

  // Lo que ya está en la página se dibuja al tiro; el menú (layout.js) llega un poco después.
  pintar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar);
  cargar().catch(() => { cargado = true; pintar(); });

  return { PRESENCIALES, TALLERES, foto, enlace };
})();
