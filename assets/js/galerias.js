/* Galerías de fotos con visor ampliado. */
const GALERIAS = {
  'vestuario': ['vestuario-39', 'vestuario-40', 'vestuario-41', 'vestuario-42', 'vestuario-43', 'vestuario-44', 'vestuario-01', 'vestuario-02', 'vestuario-03', 'vestuario-04', 'vestuario-05', 'vestuario-06', 'vestuario-07', 'vestuario-08', 'vestuario-09', 'vestuario-10', 'vestuario-11', 'vestuario-12', 'vestuario-13', 'vestuario-14', 'vestuario-15', 'vestuario-16', 'cursos-02', 'vestuario-18', 'vestuario-19', 'vestuario-20', 'vestuario-21', 'vestuario-22', 'vestuario-23', 'vestuario-24', 'vestuario-25', 'vestuario-26', 'vestuario-27', 'vestuario-28', 'vestuario-29', 'vestuario-30', 'vestuario-31', 'vestuario-32', 'vestuario-33', 'vestuario-34', 'vestuario-35', 'vestuario-36', 'vestuario-37', 'vestuario-38'],
  'accesorios': ['accesorios-23', 'accesorios-24', 'accesorios-25', 'accesorios-26', 'accesorios-27', 'accesorios-28', 'accesorios-29', 'accesorios-30', 'accesorios-01', 'accesorios-02', 'accesorios-03', 'accesorios-04', 'accesorios-05', 'accesorios-06', 'accesorios-07', 'accesorios-08', 'cursos-07', 'accesorios-10', 'accesorios-11', 'accesorios-12', 'accesorios-13', 'accesorios-14', 'accesorios-15', 'accesorios-16', 'accesorios-17', 'accesorios-18', 'accesorios-19', 'accesorios-20', 'accesorios-21', 'accesorios-22'],
  'ilustracion-textil': ['inicio-03', 'ilustracion-textil-02', 'ilustracion-textil-03', 'ilustracion-textil-04', 'ilustracion-textil-05', 'ilustracion-textil-06', 'ilustracion-textil-07', 'ilustracion-textil-08', 'ilustracion-textil-09', 'ilustracion-textil-10', 'ilustracion-textil-11', 'ilustracion-textil-12', 'ilustracion-textil-13', 'ilustracion-textil-14'],
  'arte-terapia': ['arte-terapia-01', 'arte-terapia-02', 'arte-terapia-03', 'arte-terapia-04', 'arte-terapia-05', 'arte-terapia-06', 'arte-terapia-07', 'arte-terapia-08', 'arte-terapia-09', 'arte-terapia-10', 'arte-terapia-11', 'arte-terapia-12', 'arte-terapia-13', 'arte-terapia-14', 'arte-terapia-15', 'arte-terapia-16'],
  'talleres': ['talleres-01', 'talleres-02', 'talleres-03', 'talleres-04', 'talleres-05', 'talleres-06', 'talleres-07', 'talleres-08', 'talleres-09', 'talleres-10', 'talleres-11', 'talleres-12', 'talleres-13', 'talleres-14', 'talleres-15', 'talleres-16', 'talleres-17', 'talleres-18']
};

(() => {
  const ruta = (f) => 'assets/img/' + f + '.jpg';

  // Uso: <div class="galeria" data-galeria="talleres" data-desde="1" data-hasta="5" data-titulo="..."></div>
  document.querySelectorAll('[data-galeria]').forEach(el => {
    const fotos = GALERIAS[el.dataset.galeria] || [];
    const desde = Number(el.dataset.desde || 1) - 1;
    const hasta = Number(el.dataset.hasta || fotos.length);
    const titulo = el.dataset.titulo || 'Foto';
    el.innerHTML = fotos.slice(desde, hasta).map((f, i) =>
      `<button type="button" data-src="${ruta(f)}"><img src="${ruta(f)}" alt="${titulo}, foto ${i + 1}" loading="lazy"></button>`).join('');
  });

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
