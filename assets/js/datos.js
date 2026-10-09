/* Datos del sitio.
   En el prototipo todo se guarda en el navegador (localStorage) para poder
   probar la compra, el aula y el panel. En la versión final estos datos
   vivirán en una base de datos y los pagos pasarán por Mercado Pago. */

const NM = (() => {
  const CONTACTO = {
    correo: 'moradenegro@gmail.com',
    telefono: '+56 9 3370 1311',
    whatsapp: '56933701311',
    instagram: 'moradenegro'
  };

  const TEXTOS = {
    nombre: 'Daniela Balzo',
    linea1: 'Diseñadora gráfica y de vestuario / Arteterapeuta',
    linea2: 'Clases de Costura personalizadas desde 2012',
    cursosTitulo: 'Cursos permanentes',
    cursosTexto: 'Entérate de toda la información de los cursos disponibles',
    onlineTitulo: 'Cursos online',
    onlineTexto: 'Aprende a coser a tu ritmo, desde tu casa, con clases en video que puedes ver cuando quieras.'
  };

  // Cursos de ejemplo, basados en los talleres que Daniela ya ofrece.
  const CURSOS = [
    {
      id: 'costura-basica',
      titulo: 'Taller Costura Básica',
      resumen: 'En 4 clases aprende nociones básicas sobre enhebrado, uso y manejo de máquina de coser recta, corte y confección de 3 proyectos simples.',
      precio: 35000,
      imagen: 'cursos-05.jpg',
      publicado: true,
      lecciones: [
        { titulo: 'Conoce tu máquina: enhebrado y bobina', duracion: '18 min' },
        { titulo: 'Puntadas rectas, curvas y remates', duracion: '22 min' },
        { titulo: 'Proyecto 1: estuche con cierre', duracion: '35 min' },
        { titulo: 'Proyectos 2 y 3: bolsa de tela y cojín', duracion: '40 min' }
      ],
      materiales: ['Molde estuche (PDF)', 'Molde bolsa de tela (PDF)', 'Lista de materiales (PDF)']
    },
    {
      id: 'ropa-interior',
      titulo: 'Taller Ropa Interior',
      resumen: 'En 4 clases aprende a tomar medidas, a dibujar el patrón de un conjunto de ropa interior básico y a confeccionarlo con recta y overlock.',
      precio: 45000,
      imagen: 'cursos-06.jpg',
      publicado: true,
      lecciones: [
        { titulo: 'Toma de medidas', duracion: '20 min' },
        { titulo: 'Dibujo del patrón', duracion: '38 min' },
        { titulo: 'Corte de la tela y elásticos', duracion: '25 min' },
        { titulo: 'Confección con recta y overlock', duracion: '45 min' }
      ],
      materiales: ['Tabla de medidas (PDF)', 'Patrón base (PDF)']
    },
    {
      id: 'bolsos-alforjas',
      titulo: 'Taller Bolsos y Alforjas',
      resumen: 'En 4 clases aprende a cortar y confeccionar 3 modelos de bolsos diferentes.',
      precio: 40000,
      imagen: 'cursos-07.jpg',
      publicado: true,
      lecciones: [
        { titulo: 'Materiales, telas y entretelas', duracion: '15 min' },
        { titulo: 'Bolso tote con forro', duracion: '40 min' },
        { titulo: 'Bolso con fuelle y cierre', duracion: '42 min' },
        { titulo: 'Alforja de bicicleta', duracion: '45 min' }
      ],
      materiales: ['Moldes de los 3 bolsos (PDF)']
    }
  ];

  const leer = (clave, porDefecto) => {
    try {
      const v = localStorage.getItem('nm_' + clave);
      return v ? JSON.parse(v) : structuredClone(porDefecto);
    } catch (e) { return structuredClone(porDefecto); }
  };
  const guardar = (clave, valor) => {
    try { localStorage.setItem('nm_' + clave, JSON.stringify(valor)); } catch (e) {}
  };

  return {
    CONTACTO,
    textos: () => ({ ...TEXTOS, ...leer('textos', {}) }),
    guardarTextos: (t) => guardar('textos', t),
    cursos: () => leer('cursos', CURSOS),
    guardarCursos: (c) => guardar('cursos', c),
    curso: (id) => leer('cursos', CURSOS).find(c => c.id === id),
    usuarios: () => leer('usuarios', []),
    guardarUsuarios: (u) => guardar('usuarios', u),
    ventas: () => leer('ventas', []),
    guardarVentas: (v) => guardar('ventas', v),
    progreso: () => leer('progreso', {}),
    guardarProgreso: (p) => guardar('progreso', p),
    sesion: () => leer('sesion', null),
    iniciarSesion: (correo) => guardar('sesion', { correo }),
    cerrarSesion: () => { try { localStorage.removeItem('nm_sesion'); } catch (e) {} },
    usuarioActual() {
      const s = this.sesion();
      return s ? this.usuarios().find(u => u.correo === s.correo) || null : null;
    },
    restablecer() {
      try { Object.keys(localStorage).filter(k => k.startsWith('nm_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    },
    clp: (n) => '$' + Number(n || 0).toLocaleString('es-CL'),
    esc: (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  };
})();
