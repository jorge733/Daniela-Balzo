/* Galerías de fotos con visor ampliado.
   Las fotos originales del portafolio están en datos.js (NM.GALERIAS); lo que Daniela cambia
   desde el panel vive en Firestore (sitio/galerias) y se lee con la API REST, igual que los textos. */
(() => {
  const leerCache = () => { try { return JSON.parse(sessionStorage.getItem('nm_galerias') || 'null') || {}; } catch (e) { return {}; } };
  let guardadas = leerCache();

  // Uso: <div class="galeria" data-galeria="vestuario" data-titulo="..."></div>
  // Con data-forma="tira" son fotos sin visor (las del inicio); dentro de [data-si-hay-fotos],
  // la sección entera se oculta si la galería no tiene fotos.
  // Las galerías que ya traen sus fotos (talleres, ver contenido.js) se dejan tal cual.
  function pintar() {
    document.querySelectorAll('[data-galeria]').forEach(el => {
      const nombre = el.dataset.galeria;
      const fotos = guardadas[nombre] || NM.GALERIAS[nombre];
      if (!fotos) return;
      const seccion = el.closest('[data-si-hay-fotos]');
      if (seccion) seccion.hidden = !fotos.length;
      if (el.dataset.forma === 'tira') {
        if (!guardadas[nombre]) return; // sin cambios queda la del HTML, con sus descripciones
        const html = fotos.map(f => `<img src="${NM.esc(NM.foto(f))}" alt="">`).join('');
        if (el.dataset.pintado !== html) { el.innerHTML = html; el.dataset.pintado = html; }
        el.classList.toggle('tira-libre', fotos.length !== 4);
        el.style.setProperty('--n', Math.min(fotos.length, 5));
        return;
      }
      const titulo = el.dataset.titulo || 'Foto';
      const html = fotos.map((f, i) =>
        `<button type="button" data-src="${NM.esc(NM.foto(f))}"><img src="${NM.esc(NM.foto(f))}" alt="${NM.esc(titulo)}, foto ${i + 1}" loading="lazy"></button>`).join('');
      // Solo se vuelve a dibujar si cambió algo, para no recargar las fotos.
      if (el.dataset.pintado !== html) { el.innerHTML = html; el.dataset.pintado = html; }
      // Con pocas fotos, una columna por foto y centradas
      el.classList.toggle('galeria-pocas', fotos.length > 0 && fotos.length < 4);
      el.style.setProperty('--n', fotos.length);
    });
  }
  pintar();

  const script = document.currentScript;
  if (document.querySelector('[data-galeria]:not([data-galeria="propia"])')) {
    import(new URL('config.js', script.src)).then(async ({ FIREBASE, EMULADORES }) => {
      const base = EMULADORES ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
      const r = await fetch(`${base}/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/sitio/galerias`);
      const campos = r.ok ? (await r.json()).fields || {} : {};
      const nuevas = {};
      Object.keys(campos).forEach(k => {
        const lista = campos[k].arrayValue;
        if (lista) nuevas[k] = (lista.values || []).map(v => v.stringValue).filter(Boolean);
      });
      guardadas = nuevas;
      try { sessionStorage.setItem('nm_galerias', JSON.stringify(nuevas)); } catch (e) {}
      pintar();
    }).catch(() => {});
  }

  // ----- Galerías justificadas -----
  // Como un texto justificado: las fotos se reparten en filas que llenan todo el ancho, sin
  // recortarlas, así el bloque queda con bordes rectos arriba, abajo y a los lados. Cada fila
  // tiene su propia altura. Necesita la proporción de cada foto; mientras no la sabe, la galería
  // se ve como mosaico. Las proporciones se recuerdan para que la próxima visita sea inmediata.
  const PROP = 'nm_proporciones';
  let proporciones = {};
  try { proporciones = JSON.parse(localStorage.getItem(PROP) || '{}'); } catch (e) {}
  const proporcion = (img) => {
    if (img.naturalWidth) {
      const r = img.naturalWidth / img.naturalHeight;
      if (proporciones[img.src] !== r) {
        proporciones[img.src] = r;
        clearTimeout(proporcion.t);
        proporcion.t = setTimeout(() => { try { localStorage.setItem(PROP, JSON.stringify(proporciones)); } catch (e) {} }, 500);
      }
      return r;
    }
    return proporciones[img.src];
  };

  // Reparte las proporciones en k filas seguidas lo más parejas posible (partición lineal).
  function filas(rs, k) {
    const n = rs.length, ideal = rs.reduce((a, b) => a + b, 0) / k;
    const acum = [0]; rs.forEach((r, i) => acum.push(acum[i] + r));
    const costo = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity));
    const corte = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0));
    costo[0][0] = 0;
    for (let j = 1; j <= k; j++) {
      for (let i = j; i <= n; i++) {
        for (let p = j - 1; p < i; p++) {
          const c = costo[j - 1][p] + (acum[i] - acum[p] - ideal) ** 2;
          if (c < costo[j][i]) { costo[j][i] = c; corte[j][i] = p; }
        }
      }
    }
    const res = [];
    for (let j = k, i = n; j > 0; j--) { const p = corte[j][i]; res.unshift([p, i]); i = p; }
    return res;
  }

  function justificar(el) {
    const botones = [...el.children].filter(b => b.tagName === 'BUTTON');
    const quitar = () => { el.classList.remove('justificada'); botones.forEach(b => { b.style.width = b.style.height = ''; }); };
    if (botones.length < 2) return quitar();
    const imgs = botones.map(b => b.querySelector('img'));
    imgs.forEach(i => { if (i.loading === 'lazy') i.loading = 'eager'; });
    const rs = imgs.map(proporcion);
    if (rs.some(r => !r)) return; // falta saber la proporción de alguna; se reintenta al cargar
    const W = Math.floor(el.getBoundingClientRect().width);
    if (!W) return; // oculta
    const g = innerWidth <= 560 ? 8 : 12;
    const alto = innerWidth <= 560 ? 150 : innerWidth <= 900 ? 210 : 270;
    const total = rs.reduce((a, b) => a + b, 0);
    const k = Math.min(botones.length, Math.max(1, Math.round(total * alto / W)));
    el.classList.add('justificada');
    el.style.setProperty('--g', g + 'px');
    filas(rs, k).forEach(([a, b]) => {
      const suma = rs.slice(a, b).reduce((x, y) => x + y, 0);
      let h = (W - g * (b - a - 1)) / suma;
      // Una sola fila con pocas fotos: que no queden gigantes (la fila se centra)
      const llena = !(k === 1 && h > alto * 1.5);
      if (!llena) h = alto * 1.5;
      h = Math.round(h);
      let usado = 0;
      for (let i = a; i < b; i++) {
        const w = i === b - 1 && llena ? W - g * (b - a - 1) - usado : Math.floor(rs[i] * h);
        usado += w;
        botones[i].style.width = w + 'px';
        botones[i].style.height = h + 'px';
      }
    });
  }

  const pendientes = new Set();
  const programar = (el) => {
    if (!el || el.dataset.forma === 'tira') return;
    if (!pendientes.size) setTimeout(() => { pendientes.forEach(justificar); pendientes.clear(); });
    pendientes.add(el);
  };
  const vistas = new WeakSet();
  const medir = new ResizeObserver(entradas => entradas.forEach(e => programar(e.target)));
  const buscarGalerias = () => document.querySelectorAll('.galeria[data-galeria]').forEach(el => {
    if (!vistas.has(el)) { vistas.add(el); medir.observe(el); }
    programar(el);
  });
  // Cuando llega una foto, ya se sabe su proporción
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') programar(e.target.closest('.galeria[data-galeria]')); }, true);
  // Galerías nuevas o que cambiaron (las de las clases y talleres se dibujan después, desde contenido.js)
  new MutationObserver(buscarGalerias).observe(document.body, { childList: true, subtree: true });
  buscarGalerias();

  const visor = document.createElement('div');
  visor.className = 'visor';
  visor.hidden = true;
  visor.setAttribute('role', 'dialog');
  visor.setAttribute('aria-label', 'Foto ampliada');
  visor.innerHTML = '<img alt=""><button class="cerrar" aria-label="Cerrar">×</button>' +
    '<button class="ant" aria-label="Foto anterior">‹</button><button class="sig" aria-label="Foto siguiente">›</button>' +
    '<div class="contador"></div>';
  document.body.appendChild(visor);
  const img = visor.querySelector('img');
  let lista = [], pos = 0;

  const mostrar = () => {
    const b = lista[pos];
    img.src = b.dataset.src;
    img.alt = b.querySelector('img').alt;
    visor.querySelector('.contador').textContent = (pos + 1) + ' de ' + lista.length;
  };
  const mover = (d) => { pos = (pos + d + lista.length) % lista.length; mostrar(); };
  const cerrar = () => { visor.hidden = true; document.body.style.overflow = ''; };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-galeria] button');
    if (!b) return;
    lista = [...b.parentElement.querySelectorAll('button')];
    pos = lista.indexOf(b);
    mostrar();
    visor.hidden = false;
    document.body.style.overflow = 'hidden';
    visor.querySelector('.cerrar').focus();
  });
  visor.querySelector('.cerrar').onclick = cerrar;
  visor.querySelector('.ant').onclick = () => mover(-1);
  visor.querySelector('.sig').onclick = () => mover(1);
  visor.addEventListener('click', (e) => { if (e.target === visor) cerrar(); });
  document.addEventListener('keydown', (e) => {
    if (visor.hidden) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
})();
