/* Galerías de fotos con visor ampliado.
   Las fotos originales del portafolio están en datos.js (NM.GALERIAS); lo que Daniela cambia
   desde el panel vive en Firestore (sitio/galerias) y se lee con la API REST, igual que los textos. */
(() => {
  const leerCache = () => { try { return JSON.parse(sessionStorage.getItem('nm_galerias') || 'null') || {}; } catch (e) { return {}; } };
  let guardadas = leerCache();

  // Uso: <div class="galeria" data-galeria="vestuario" data-titulo="..."></div>
  // Las galerías que ya traen sus fotos (talleres, ver contenido.js) se dejan tal cual.
  function pintar() {
    document.querySelectorAll('[data-galeria]').forEach(el => {
      const nombre = el.dataset.galeria;
      const fotos = guardadas[nombre] || NM.GALERIAS[nombre];
      if (!fotos) return;
      const titulo = el.dataset.titulo || 'Foto';
      const html = fotos.map((f, i) =>
        `<button type="button" data-src="${NM.esc(NM.foto(f))}"><img src="${NM.esc(NM.foto(f))}" alt="${NM.esc(titulo)}, foto ${i + 1}" loading="lazy"></button>`).join('');
      // Solo se vuelve a dibujar si cambió algo, para no recargar las fotos.
      if (el.dataset.pintado !== html) { el.innerHTML = html; el.dataset.pintado = html; }
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
