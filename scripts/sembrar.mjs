/* Carga datos de prueba en los emuladores: los 3 cursos y 2 patrones de ejemplo, los textos,
   una cuenta para el panel y una alumna.  Uso: npm run sembrar  (con los emuladores encendidos) */
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
process.env.GCLOUD_PROJECT ||= 'demo-negramora';

const { auth, db, bucket } = await import('../api/_lib/firebase.js');

// Cuentas solo para los emuladores (no existen en Firebase real)
const PANEL = { email: 'panel@prueba.test', password: 'prueba123', displayName: 'Daniela (prueba)' };
const ALUMNA = { email: 'alumna@prueba.test', password: 'prueba123', displayName: 'Alumna de prueba' };

const CURSOS = [
  {
    id: 'costura-basica', orden: 0, nivel: 'basico', publicado: true, precio: 35000, imagen: 'cursos-05.jpg',
    titulo: 'Taller Costura Básica',
    resumen: 'En 4 clases aprende nociones básicas sobre enhebrado, uso y manejo de máquina de coser recta, corte y confección de 3 proyectos simples.',
    requisitos: 'Una máquina de coser recta que funcione, tijeras de tela y alfileres.',
    lecciones: [
      { titulo: 'Conoce tu máquina: enhebrado y bobina', duracion: '' },
      { titulo: 'Puntadas rectas, curvas y remates', duracion: '' },
      { titulo: 'Proyecto 1: estuche con cierre', duracion: '' },
      { titulo: 'Proyectos 2 y 3: bolsa de tela y cojín', duracion: '' }
    ],
    materiales: []
  },
  {
    id: 'ropa-interior', orden: 1, nivel: 'intermedio', categoria: 'vestuario', publicado: true, precio: 45000, imagen: 'cursos-06.jpg',
    titulo: 'Taller Ropa Interior',
    resumen: 'En 4 clases aprende a tomar medidas, a dibujar el patrón de un conjunto de ropa interior básico y a confeccionarlo con recta y overlock.',
    requisitos: 'Máquina recta y overlock, y saber lo básico de costura.',
    lecciones: [
      { titulo: 'Toma de medidas', duracion: '' },
      { titulo: 'Dibujo del patrón', duracion: '' },
      { titulo: 'Corte de la tela y elásticos', duracion: '' },
      { titulo: 'Confección con recta y overlock', duracion: '' }
    ],
    materiales: []
  },
  {
    id: 'bolsos-alforjas', orden: 2, nivel: 'basico', categoria: 'accesorios', publicado: true, precio: 40000, imagen: 'cursos-07.jpg',
    titulo: 'Taller Bolsos y Alforjas',
    resumen: 'En 4 clases aprende a cortar y confeccionar 3 modelos de bolsos diferentes.',
    requisitos: '',
    lecciones: [
      { titulo: 'Materiales, telas y entretelas', duracion: '' },
      { titulo: 'Bolso tote con forro', duracion: '' },
      { titulo: 'Bolso con fuelle y cierre', duracion: '' },
      { titulo: 'Alforja de bicicleta', duracion: '' }
    ],
    materiales: []
  }
];

// Patrones en PDF: van en la misma colección que los cursos, con tipo "patron".
// La primera foto es la portada; las demás se ven en la ficha (por ejemplo, las piezas para cortar).
const PATRONES = [
  {
    id: 'patron-bolso-tote', tipo: 'patron', orden: 0, categoria: 'accesorios', publicado: true, precio: 6000,
    titulo: 'Patrón bolso tote con forro',
    resumen: 'Bolso amplio con forro, bolsillo interior y asas largas. Ideal para empezar.',
    detalles: 'Nivel básico\nMedidas del bolso terminado: 40 x 38 cm\nIncluye las piezas para cortar e instrucciones paso a paso',
    fotos: ['accesorios-08.jpg', 'accesorios-01.jpg', 'accesorios-02.jpg', 'accesorios-03.jpg'],
    lecciones: [], materiales: [{ nombre: 'Patrón bolso tote', ruta: 'cursos/patron-bolso-tote/materiales/patron-bolso-tote.pdf' }]
  },
  {
    id: 'patron-estuche', tipo: 'patron', orden: 1, categoria: 'accesorios', publicado: true, precio: 4000,
    titulo: 'Patrón estuche con cierre',
    resumen: 'Estuche forrado con cierre, en dos tamaños.',
    detalles: '',
    fotos: ['accesorios-12.jpg', 'accesorios-13.jpg'],
    lecciones: [], materiales: [{ nombre: 'Patrón estuche', ruta: 'cursos/patron-estuche/materiales/patron-estuche.pdf' }]
  }
];

// PDF mínimo de una página con el nombre del patrón (sin tildes, la letra base no las trae), para probar la descarga
const pdf = (texto) => {
  const t = texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const flujo = 'BT /F1 24 Tf 72 760 Td (' + t + ') Tj ET';
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    '<< /Length ' + flujo.length + ' >>\nstream\n' + flujo + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let salida = '%PDF-1.4\n';
  const pos = objetos.map((o, i) => { const p = salida.length; salida += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; return p; });
  const xref = salida.length;
  salida += 'xref\n0 ' + (objetos.length + 1) + '\n0000000000 65535 f \n' + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('');
  return salida + 'trailer\n<< /Size ' + (objetos.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
};

async function cuenta(datos) {
  try { return await auth.getUserByEmail(datos.email); }
  catch (e) { return auth.createUser(datos); }
}

const panel = await cuenta(PANEL);
const alumna = await cuenta(ALUMNA);
await auth.setCustomUserClaims(panel.uid, { admin: true });
await db.doc(`admins/${panel.uid}`).set({ correo: PANEL.email });
await db.doc(`usuarios/${alumna.uid}`).set({ nombre: ALUMNA.displayName, correo: ALUMNA.email, creado: new Date() });
await db.doc('sitio/textos').set({}, { merge: true });
for (const { id, ...c } of CURSOS) await db.doc(`cursos/${id}`).set(c);
for (const { id, ...p } of PATRONES) {
  await db.doc(`cursos/${id}`).set({ ...p, imagen: p.fotos[0] });
  for (const m of p.materiales) await bucket.file(m.ruta).save(pdf(p.titulo), { contentType: 'application/pdf' });
}

console.log('Listo. Cursos y patrones de ejemplo cargados.');
console.log(`Panel:  ${PANEL.email} / ${PANEL.password}`);
console.log(`Alumna: ${ALUMNA.email} / ${ALUMNA.password} (sin cursos comprados)`);
process.exit(0);
