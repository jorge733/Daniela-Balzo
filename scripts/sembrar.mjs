/* Carga datos de prueba en los emuladores: los 3 cursos de ejemplo, los textos,
   una cuenta para el panel y una alumna.  Uso: npm run sembrar  (con los emuladores encendidos) */
process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
process.env.GCLOUD_PROJECT ||= 'demo-negramora';

const { auth, db } = await import('../api/_lib/firebase.js');

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
    id: 'ropa-interior', orden: 1, nivel: 'intermedio', categoria: 'vestuario-femenino', publicado: true, precio: 45000, imagen: 'cursos-06.jpg',
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

console.log('Listo. Cursos de ejemplo cargados.');
console.log(`Panel:  ${PANEL.email} / ${PANEL.password}`);
console.log(`Alumna: ${ALUMNA.email} / ${ALUMNA.password} (sin cursos comprados)`);
process.exit(0);
