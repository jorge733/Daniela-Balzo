/* Datos fijos del sitio y utilidades comunes.
   Los cursos, cuentas, compras y textos editables viven en Firebase (ver nube.js). */

const NM = (() => {
  // Mientras sea true, el sitio muestra el aviso de sitio en construcción.
  const MODO_PRUEBA = true;

  // Textos que Daniela puede cambiar desde el panel (sitio/textos). Estos son los valores por defecto
  // de los que arma layout.js; los demás textos de cada página tienen su valor original en el HTML,
  // marcados con data-texto (ver ponerTextos).
  const TEXTOS = {
    nombre: 'Daniela Balzo',
    marca: 'Negra Mora · Clases de costura',
    linea1: 'Diseñadora gráfica y de vestuario / Arteterapeuta',
    linea2: 'Clases de Costura personalizadas desde 2012',
    cursosTitulo: 'Cursos permanentes',
    cursosTexto: 'Entérate de toda la información de los cursos disponibles',
    onlineTitulo: 'Cursos online',
    onlineTexto: 'Aprende a coser a tu ritmo, desde tu casa, con clases en video que puedes ver cuando quieras.',
    correo: 'moradenegro@gmail.com',
    telefono: '+56 9 3370 1311',
    instagram: 'moradenegro',
    direccion: 'La Reina, a pasos del metro Francisco Bilbao (L4)'
  };

  let guardados = {};
  try { guardados = JSON.parse(sessionStorage.getItem('nm_textos') || '{}'); } catch (e) {}

  // Teléfono para wa.me: "+56 9 3370 1311" -> "56933701311" (un celular de 9 dígitos sin +56 también sirve)
  const numeroWhatsapp = (tel) => { const n = String(tel || '').replace(/\D/g, ''); return n.length === 9 ? '56' + n : n; };
  const contactoDe = (t) => ({
    correo: t.correo,
    telefono: t.telefono,
    whatsapp: numeroWhatsapp(t.telefono),
    instagram: String(t.instagram || '').replace(/^@/, '')
  });
  // Se actualiza en el mismo objeto cuando llegan los textos guardados, así todos ven el valor nuevo.
  const CONTACTO = contactoDe({ ...TEXTOS, ...guardados });

  // Clases presenciales y talleres originales (lo editado en el panel vive en Firestore, ver contenido.js).
  // El servidor también lee este archivo para cobrar el precio correcto mientras no haya nada guardado.
  // En los textos, lo que va entre *asteriscos* sale en negrita.
  const PRESENCIALES = [
    {
      id: 'clases-grupales', pagina: 'clases-grupales', visible: true,
      titulo: 'Clases personalizadas grupales',
      modalidad: 'En el taller · La Reina',
      bajada: '¿Tienes un proyecto en mente? Acá lo hacemos realidad.',
      resumen: 'Aprende a dar vida a tus ideas. En este taller 100% personalizado, volvemos realidad tus proyectos. Si no tienes experiencia no pasa nada, partimos de cero y si la tienes, te damos la bienvenida, ¡podemos hacer cosas increíbles! Clases grupales en mi taller, máximo 3 cupos.',
      imagen: 'cursos-02.jpg',
      fotos: ['clases-grupales-01.jpg', 'clases-grupales-02.jpg', 'clases-grupales-03.jpg'],
      descripcion: '*Este taller se enfoca en tus necesidades.* ¿Quieres hacer arreglos? ¿Diseñar y confeccionar pantalones? ¿Cortinas para tu hogar? ¿Un vestido para tu fiesta de graduación?\n\n*Te ayudo a concretar tus proyectos*; si son complejos no importa, lo podemos hacer aunque demore más tiempo.',
      puntosTitulo: '',
      puntos: '*1 módulo: 4 clases de 2 horas* (puedes tomar los módulos que quieras hasta concretar todos tus proyectos)\n*Máximo 3 cupos* por jornada de clases\nAprende a usar *recta, overlock y colleretera* según complejidad del proyecto (si quieres traer tu máquina puedes hacerlo, pero no es requisito)\n*Incluye* uso de máquinas recta, overlock y colleretera, herramientas para cortar, marcar y medir, alfileres, agujas e hilos.\n*No incluye* papel para molde, telas o insumos como cierres, botones, elásticos, etc.\n*No se hacen devoluciones de dinero en caso de faltar a clases.* Pero si necesitas reagendar, podemos hacerlo.',
      precio: 120000, unidad: 'módulo',
      duracion: '4 clases de 2 horas · máx. 3 personas',
      datos: 'Dónde: en La Reina, a pasos del metro Fco. Bilbao L4\nHorarios: lunes, miércoles, jueves y viernes de 10:00 a 12:00 o de 11:00 a 13:00. Sábado de 11:30 a 13:30. Miércoles de 15:30 a 17:30 o de 16:00 a 18:00.',
      inscripcion: 'Paga aquí con Mercado Pago y luego coordinamos el horario por WhatsApp. Si tienes dudas antes de pagar, escríbeme.',
      whatsapp: 'Hola Daniela, quiero inscribirme en las clases grupales.',
      recuadros: []
    },
    {
      id: 'clases-domicilio', pagina: 'clases-domicilio', visible: true,
      titulo: 'Clases a domicilio',
      modalidad: 'A domicilio',
      bajada: '¿Te gustaría aprender a usar tu máquina de coser? ¿O ya sabes usarla pero no sabes cómo sacarle provecho y llevar a cabo tus proyectos de costura? Yo te ayudo.',
      resumen: '¿Tienes una máquina y no sabes usarla? ¿Siempre quisiste aprender a coser pero no tienes tiempo de trasladarte? Voy a tu casa, te enseño a usar tu máquina y los proyectos que quieras realizar.',
      imagen: 'cursos-03.jpg',
      fotos: ['clases-domicilio-01.jpg', 'clases-domicilio-02.jpg', 'cursos-05.jpg'],
      descripcion: 'Voy a tu casa y te enseño a coser. Las clases son 100% personalizadas, trabajamos en los proyectos que tú quieras y te asesoro sobre los materiales e insumos que necesites.\n\nPueden ser clases grupales o 1:1.',
      puntosTitulo: '',
      puntos: '*1 módulo:* 4 clases de 2 horas (puedes tomar los módulos que quieras hasta concretar todos tus proyectos)\n*Máximo 2 cupos* por jornada de clases (de 3 a 5 personas se agregan $20.000 por clase)\n*Aprende a usar recta, overlock y colleretera* según complejidad del proyecto\n*No incluye* materiales ni herramientas\n*No se hacen devoluciones de dinero en caso de faltar a clases.* Pero si necesitas reagendar, podemos hacerlo.',
      precio: 200000, unidad: 'módulo',
      duracion: '4 clases de 2 horas · grupal o 1:1',
      datos: 'Dónde: a domicilio\nHorarios: a convenir',
      inscripcion: 'Paga aquí con Mercado Pago y luego coordinamos el horario por WhatsApp. Si tienes dudas antes de pagar, escríbeme.',
      whatsapp: 'Hola Daniela, quiero clases a domicilio.',
      recuadros: []
    },
    {
      id: 'clases-online', pagina: 'clases-online', visible: true,
      titulo: 'Clases online por Zoom',
      modalidad: 'Online en vivo',
      bajada: 'Te enseño a coser desde la comodidad de tu hogar, en tu espacio y a tu tiempo.',
      resumen: '¿Vives en otra región o no tienes tiempo de trasladarte? No te preocupes, podemos hacer una clase online desde la comodidad de tu escritorio.',
      imagen: 'cursos-04.jpg',
      fotos: [],
      descripcion: 'Las clases se organizan en *4 jornadas de 1 hora 30 min*, lo que corresponde a *un módulo de clase*. Las clases se realizan por zoom, yo estaré con dos cámaras.\n\nContacto permanente en WhatsApp para coordinar clases, resolver dudas y ayudarte paso a paso mientras dure el proyecto.',
      puntosTitulo: 'Contenidos',
      puntos: 'Uso y manejo de tu máquina de coser (recta, overlock y colleretera)\nMoldaje, corte y confección de uno o más proyectos a tu elección\nToma de medidas\nCorte adecuado de la tela\nDatos sobre cómo elegir materiales, cuánto comprar y dónde\n*No se hacen devoluciones de dinero en caso de faltar a clases.* Pero si necesitas reagendar, podemos hacerlo.',
      precio: 120000, unidad: 'módulo',
      duracion: '4 jornadas de 1 h 30 min por Zoom',
      datos: 'Horarios: a convenir\nModalidad: online por Zoom',
      inscripcion: 'Paga aquí con Mercado Pago y luego coordinamos los días y horarios por WhatsApp. Si tienes dudas antes de pagar, escríbeme.',
      whatsapp: 'Hola Daniela, quiero tomar clases online.',
      recuadros: [
        { titulo: '¿Qué materiales necesitas para partir?', imagen: 'clases-online-01.jpg', texto: 'Una máquina de coser que esté funcionando. Tijeras nuevas, alfileres, tiza para marcar tela, huincha de medir, tijeras de papel, papeles para dibujar moldes (craft, mantequilla o bond), regla de 50 cm, reglas de confección, cuaderno y lápiz, agujas para máquina y agujas para coser a mano, hilos, crea cruda.' },
        { titulo: '¿Qué vamos a hacer?', imagen: 'clases-online-02.jpg', texto: 'Me gustaría que nos enfocáramos en tus necesidades, ¿qué te gustaría aprender a ti? En base a eso, te puedo hacer una pauta metodológica sobre qué vamos a trabajar y cómo.' },
        { titulo: '¿Estás partiendo y necesitas ayuda con los patrones?', imagen: 'clases-online-03.jpg', texto: 'Incluye algunos moldes para que puedas crear proyectos simples de bolsas, estuches y otros.' }
      ]
    }
  ];

  const fotosTaller = (...n) => n.map(x => `talleres-${String(x).padStart(2, '0')}.jpg`);
  const TALLERES = [
    { anios: '2012 - 2026', titulo: 'Talleres de moldaje, corte y confección personalizados', fotos: fotosTaller(17, 16, 22, 18),
      texto: 'Actualmente trabajo en un taller en Francisco Bilbao, La Reina. Aquí tengo máquinas de coser, herramientas y todos los materiales para que puedas hacer tus proyectos realidad.' },
    { anios: '2025 - 2026', titulo: 'Taller de corte y confección, Corporación Cultural de La Reina', fotos: fotosTaller(1, 2, 3, 4, 5, 19),
      texto: 'Durante un año nos reunimos de manera semanal con un grupo de 10 a 12 personas sin experiencia en costura. Cada una llevaba su máquina. Al principio hicimos proyectos simples como estuches, arreglos y bolsas tote bag; luego seguimos con bolsos acolchados y cojines, y actualmente estamos empezando con moldaje y confección de vestuario.' },
    { anios: '2025', titulo: 'Taller de arpillera e ilustración textil, Estadio Español', fotos: fotosTaller(23, 24, 25, 26, 27, 28),
      texto: 'En el marco de los 75 años del Estadio Español, realizamos una arpillera de 4 metros de largo por 1 metro de alto con un grupo de 15 mujeres, representando una cartografía del Estadio, sus actividades principales y sus integrantes. Fue una experiencia desafiante y maravillosa.' },
    { anios: '2025', titulo: 'Taller de costura básica y reciclaje textil, Laboratorio Ciudadano, Independencia', fotos: fotosTaller(6, 7, 8, 9),
      texto: 'Durante 3 meses, y con el patrocinio de Brother, realicé un taller de uso y manejo de máquinas de coser y costura básica a 3 grupos de aproximadamente 15 mujeres. Hicimos arreglos de ropa, scrunchies, estuches y bolsos.' },
    { anios: '2024', titulo: 'Charla y taller de upcycling, Duoc UC, Plaza Vespucio', fotos: fotosTaller(10, 11, 29, 30),
      texto: 'Fui invitada, en el marco de la Semana del Medio Ambiente, a dar una charla sobre el impacto de la industria textil en el mundo. Luego invité a los estudiantes de Duoc a producir una colección en 30 minutos, solo con tijeras, alfileres y jeans reutilizados.' },
    { anios: '2023', titulo: 'Talleres de diseño y confección, reciclaje textil en Balmaceda Arte Joven, Santiago', fotos: fotosTaller(12, 13),
      texto: 'Durante 6 meses trabajé en Balmaceda Arte Joven realizando talleres de accesorios y reciclaje textil con varios grupos de jóvenes de entre 18 y 25 años. Los productos que hicimos alimentaron la tienda Vitrina BAJ, una iniciativa de tienda colaborativa que promueve el reciclaje textil y el trabajo artesanal.' },
    { anios: '2021', titulo: 'Talleres de uso y manejo de máquinas recta y overlock, Junta de Vecinos de Polpaico, Tiltil', fotos: fotosTaller(14, 15),
      texto: 'Fui invitada a realizar 2 cursos de uso y manejo de máquinas recta y overlock, con el patrocinio de Brother, en la junta de vecinos de Tiltil. Realicé dos jornadas de 3 horas cada una para la comunidad del sector.' }
  ];

  // Niveles de los cursos online, de lo más simple a lo más complejo
  const NIVELES = [
    { id: 'basico', nombre: 'Básico', titulo: 'Para empezar desde cero' },
    { id: 'intermedio', nombre: 'Intermedio', titulo: 'Si ya sabes usar tu máquina' },
    { id: 'avanzado', nombre: 'Avanzado', titulo: 'Para perfeccionar tu técnica' }
  ];
  const posNivel = (c) => Math.max(0, NIVELES.findIndex(n => n.id === c.nivel));

  // Galerías del portafolio originales (lo editado en el panel vive en sitio/galerias, ver galerias.js)
  const serie = (nombre, ...n) => n.map(x => `${nombre}-${String(x).padStart(2, '0')}.jpg`);
  const desde = (nombre, a, b) => serie(nombre, ...Array.from({ length: b - a + 1 }, (_, i) => a + i));
  const GALERIAS = {
    'vestuario': [...desde('vestuario', 39, 45), ...desde('vestuario', 1, 16), 'cursos-02.jpg', ...desde('vestuario', 18, 38)],
    'accesorios': [...desde('accesorios', 23, 30), ...desde('accesorios', 1, 8), 'cursos-07.jpg', ...desde('accesorios', 10, 22)],
    'ilustracion-textil': ['inicio-03.jpg', ...desde('ilustracion-textil', 2, 14)],
    'arte-terapia': desde('arte-terapia', 1, 16),
    // Fotos bajo la portada del inicio
    'inicio-tira': desde('inicio', 1, 4),
    // Secciones "Más fotos" de cada página: parten vacías y no se muestran hasta que Daniela suba fotos
    'inicio': [], 'quien-soy': [], 'cursos': [], 'contacto': [], 'patrones': []
  };

  // ---------- Textos editables en las páginas ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** Texto con *negritas*, ya escapado. */
  const fmt = (s) => esc(s).replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  const lineas = (s) => String(s || '').split('\n').map(l => l.trim()).filter(Boolean);
  /** Foto del sitio ("cursos-02.jpg") o subida desde el panel (https://…). */
  const foto = (f) => /^https?:/.test(f || '') ? f : 'assets/img/' + (f || 'cursos-05.jpg');

  // Cómo se dibuja cada tipo de texto (data-tipo). Sin tipo, es texto simple.
  const DIBUJAR = {
    parrafos: (v) => String(v).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${fmt(p).replace(/\n/g, '<br>')}</p>`).join(''),
    lista: (v) => lineas(v).map(l => `<li>${fmt(l)}</li>`).join(''),
    // "2012: Creé mi marca…" -> año en negrita y texto al lado
    'linea-tiempo': (v) => lineas(v).map(l => {
      const i = l.indexOf(':');
      return i > 0 ? `<li><b>${esc(l.slice(0, i).trim())}</b><span>${fmt(l.slice(i + 1).trim())}</span></li>` : `<li><span>${fmt(l)}</span></li>`;
    }).join('')
  };

  /** Pone los textos y fotos guardados en los elementos con data-texto (los demás quedan como en el HTML). */
  function ponerTextos(raiz = document) {
    const t = { ...TEXTOS, ...guardados };
    raiz.querySelectorAll('[data-texto]').forEach(el => {
      const v = t[el.dataset.texto];
      if (!v) return;
      const tipo = el.dataset.tipo;
      if (tipo === 'foto') { if (el.getAttribute('src') !== foto(v)) el.src = foto(v); return; }
      if (DIBUJAR[tipo]) { const html = DIBUJAR[tipo](v); if (el.dataset.puesto !== html) { el.innerHTML = html; el.dataset.puesto = html; } return; }
      if (el.textContent !== v) el.textContent = v;
    });
  }

  // Cambia el correo, el teléfono y el Instagram en enlaces y textos que vienen escritos en el HTML.
  function cambiarContacto(antes, ahora) {
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      let n = h;
      if (/wa\.me\/\d+/.test(h)) n = h.replace(/wa\.me\/\d+/, 'wa.me/' + ahora.whatsapp);
      else if (h.startsWith('mailto:')) n = 'mailto:' + ahora.correo;
      else if (/instagram\.com\//.test(h)) n = 'https://instagram.com/' + ahora.instagram;
      if (n !== h) a.setAttribute('href', n);
    });
    const cambios = [[antes.correo, ahora.correo], [antes.telefono, ahora.telefono], ['@' + antes.instagram, '@' + ahora.instagram]]
      .filter(([a, b]) => a && b && a !== b);
    if (!cambios.length) return;
    const nodos = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = nodos.nextNode(); n; n = nodos.nextNode()) {
      let v = n.nodeValue;
      cambios.forEach(([a, b]) => { v = v.split(a).join(b); });
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  /** Llegaron los textos guardados en Firestore: se usan desde ya y se repintan. */
  function actualizarTextos(nuevos) {
    guardados = nuevos;
    try { sessionStorage.setItem('nm_textos', JSON.stringify(nuevos)); } catch (e) {}
    const antes = { ...CONTACTO };
    Object.assign(CONTACTO, contactoDe({ ...TEXTOS, ...guardados }));
    cambiarContacto(antes, CONTACTO);
    ponerTextos();
  }

  /** Al cargar la página: lo escrito en el HTML trae el contacto original. */
  function prepararTextos() {
    cambiarContacto(contactoDe(TEXTOS), CONTACTO);
    ponerTextos();
  }

  return {
    MODO_PRUEBA,
    CONTACTO,
    TEXTOS,
    NIVELES,
    PRESENCIALES,
    TALLERES,
    GALERIAS,
    contactoDe,
    numeroWhatsapp,
    ponerTextos,
    prepararTextos,
    actualizarTextos,
    fmt,
    foto,
    /** Nivel de un curso (los cursos sin nivel cuentan como básicos). */
    nivel: (c) => NIVELES[posNivel(c)],
    /** Ordena cursos de lo más simple a lo más complejo y luego por el orden del panel. */
    ordenarCursos: (lista) => lista.sort((a, b) => posNivel(a) - posNivel(b) || (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo)),
    textos: () => ({ ...TEXTOS, ...guardados }),
    /** Foto de un curso: una de las fotos del sitio o una subida desde el panel. */
    imagen: (c) => /^https?:/.test(c.imagen || '') ? c.imagen : 'assets/img/' + (c.imagen || 'cursos-05.jpg'),
    clp: (n) => '$' + Number(n || 0).toLocaleString('es-CL'),
    esc
  };
})();
