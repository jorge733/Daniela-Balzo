/* Datos fijos del sitio y utilidades comunes.
   Los cursos, cuentas, compras y textos editables viven en Firebase (ver nube.js). */

const NM = (() => {
  // Mientras sea true, el sitio muestra el aviso de versión de prueba.
  const MODO_PRUEBA = true;

  const CONTACTO = {
    correo: 'moradenegro@gmail.com',
    telefono: '+56 9 3370 1311',
    whatsapp: '56933701311',
    instagram: 'moradenegro'
  };

  // Textos que Daniela puede cambiar desde el panel. Estos son los valores por defecto.
  const TEXTOS = {
    nombre: 'Daniela Balzo',
    linea1: 'Diseñadora gráfica y de vestuario / Arteterapeuta',
    linea2: 'Clases de Costura personalizadas desde 2012',
    cursosTitulo: 'Cursos permanentes',
    cursosTexto: 'Entérate de toda la información de los cursos disponibles',
    onlineTitulo: 'Cursos online',
    onlineTexto: 'Aprende a coser a tu ritmo, desde tu casa, con clases en video que puedes ver cuando quieras.'
  };

  // Niveles de los cursos online, de lo más simple a lo más complejo
  const NIVELES = [
    { id: 'basico', nombre: 'Básico', titulo: 'Para empezar desde cero' },
    { id: 'intermedio', nombre: 'Intermedio', titulo: 'Si ya sabes usar tu máquina' },
    { id: 'avanzado', nombre: 'Avanzado', titulo: 'Para perfeccionar tu técnica' }
  ];
  const posNivel = (c) => Math.max(0, NIVELES.findIndex(n => n.id === c.nivel));

  let guardados = {};
  try { guardados = JSON.parse(sessionStorage.getItem('nm_textos') || '{}'); } catch (e) {}

  return {
    MODO_PRUEBA,
    CONTACTO,
    TEXTOS,
    NIVELES,
    /** Nivel de un curso (los cursos sin nivel cuentan como básicos). */
    nivel: (c) => NIVELES[posNivel(c)],
    /** Ordena cursos de lo más simple a lo más complejo y luego por el orden del panel. */
    ordenarCursos: (lista) => lista.sort((a, b) => posNivel(a) - posNivel(b) || (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo)),
    textos: () => ({ ...TEXTOS, ...guardados }),
    /** Foto de un curso: una de las fotos del sitio o una subida desde el panel. */
    imagen: (c) => /^https?:/.test(c.imagen || '') ? c.imagen : 'assets/img/' + (c.imagen || 'cursos-05.jpg'),
    clp: (n) => '$' + Number(n || 0).toLocaleString('es-CL'),
    esc: (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  };
})();
