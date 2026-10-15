/* Conexión con Firebase: cuentas, cursos, accesos, avance, ventas y archivos.
   Las compras solo las registra el servidor (/api) cuando Mercado Pago confirma el pago. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {
  getAuth, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, signOut
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getFirestore, connectFirestoreEmulator, doc, getDoc, getDocs, setDoc, deleteDoc,
  collection, query, where, orderBy, limit, serverTimestamp, getCountFromServer
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {
  getStorage, connectStorageEmulator, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js';
import { FIREBASE, EMULADORES } from './config.js';

const app = initializeApp(FIREBASE);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
auth.languageCode = 'es';

if (EMULADORES) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

// ---------- Cuenta ----------

/** Resuelve con el usuario actual (o null) cuando Firebase termina de revisar la sesión. */
export const usuarioListo = () => new Promise((ok) => {
  const fin = onAuthStateChanged(auth, (u) => { fin(); ok(u); });
});

export const alCambiarSesion = (cb) => onAuthStateChanged(auth, cb);
export const usuarioActual = () => auth.currentUser;

export async function crearCuenta(nombre, correo, clave) {
  const { user } = await createUserWithEmailAndPassword(auth, correo, clave);
  await updateProfile(user, { displayName: nombre });
  await setDoc(doc(db, 'usuarios', user.uid), { nombre, correo: user.email, creado: serverTimestamp() });
  return user;
}

export const entrar = async (correo, clave) => (await signInWithEmailAndPassword(auth, correo, clave)).user;
export const salir = () => signOut(auth);
export const recuperarClave = (correo) => sendPasswordResetEmail(auth, correo);

export async function esAdmin(u = auth.currentUser) {
  if (!u) return false;
  try { return (await getDoc(doc(db, 'admins', u.uid))).exists(); } catch (e) { return false; }
}

const MENSAJES = {
  'auth/invalid-credential': 'El correo o la contraseña no coinciden.',
  'auth/wrong-password': 'El correo o la contraseña no coinciden.',
  'auth/user-not-found': 'El correo o la contraseña no coinciden.',
  'auth/invalid-email': 'Revisa que el correo esté bien escrito.',
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Entra con tu contraseña.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  'auth/network-request-failed': 'No hay conexión. Revisa tu internet.'
};
export const mensajeError = (e) => MENSAJES[e && e.code] || 'Algo salió mal. Vuelve a intentarlo.';

// ---------- Textos del sitio ----------

export async function textos() {
  try {
    const d = await getDoc(doc(db, 'sitio', 'textos'));
    return d.exists() ? d.data() : {};
  } catch (e) { return {}; }
}
export const guardarTextos = (t) => setDoc(doc(db, 'sitio', 'textos'), t, { merge: true });

/** Clases presenciales o talleres guardados desde el panel (null si nunca se guardaron). */
export async function contenido(nombre) {
  const d = await getDoc(doc(db, 'sitio', nombre));
  return d.exists() ? d.data().lista || null : null;
}
export const guardarContenido = (nombre, lista) => setDoc(doc(db, 'sitio', nombre), { lista, actualizado: serverTimestamp() });

// ---------- Cursos ----------

const conId = (d) => ({ id: d.id, lecciones: [], materiales: [], ...d.data() });
const ordenar = (lista) => NM.ordenarCursos(lista);

export async function cursosPublicados() {
  const r = await getDocs(query(collection(db, 'cursos'), where('publicado', '==', true)));
  return ordenar(r.docs.map(conId));
}

export async function todosLosCursos() {
  const r = await getDocs(collection(db, 'cursos'));
  return ordenar(r.docs.map(conId));
}

/** Un curso por id. Devuelve null si no existe o no está publicado (salvo para Daniela). */
export async function curso(id) {
  try {
    const d = await getDoc(doc(db, 'cursos', id));
    return d.exists() ? conId(d) : null;
  } catch (e) { return null; }
}

export async function guardarCurso({ id, ...datos }) {
  await setDoc(doc(db, 'cursos', id), { ...datos, actualizado: serverTimestamp() });
}
export const borrarCurso = (id) => deleteDoc(doc(db, 'cursos', id));

// ---------- Estudiante: accesos y avance ----------

/** Ids de los cursos que compró quien inició sesión. */
export async function misCursos(u = auth.currentUser) {
  if (!u) return [];
  try {
    const d = await getDoc(doc(db, 'accesos', u.uid));
    return d.exists() ? Object.keys(d.data().cursos || {}) : [];
  } catch (e) { return []; }
}

export async function progreso(u = auth.currentUser) {
  const d = await getDoc(doc(db, 'progreso', u.uid));
  return d.exists() ? d.data() : {};
}
export const guardarAvance = (cursoId, hechas, u = auth.currentUser) =>
  setDoc(doc(db, 'progreso', u.uid), { [cursoId]: hechas }, { merge: true });

// ---------- Panel: ventas y estudiantes ----------

export async function ventas(max = 200) {
  const r = await getDocs(query(collection(db, 'ventas'), orderBy('fecha', 'desc'), limit(max)));
  return r.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function tieneVentas(cursoId) {
  return !(await getDocs(query(collection(db, 'ventas'), where('curso', '==', cursoId), limit(1)))).empty;
}
export async function totalAlumnas() {
  return (await getCountFromServer(collection(db, 'usuarios'))).data().count;
}

// ---------- Archivos ----------

/** Sube un archivo a Storage. Llama a alAvanzar(0..100) y resuelve con la ruta. */
export function subirArchivo(ruta, archivo, alAvanzar = () => {}) {
  return new Promise((ok, mal) => {
    const tarea = uploadBytesResumable(ref(storage, ruta), archivo, { contentType: archivo.type || undefined });
    tarea.on('state_changed',
      (s) => alAvanzar(Math.round(100 * s.bytesTransferred / s.totalBytes)),
      mal,
      () => ok(ruta));
  });
}
export const urlPublica = (ruta) => getDownloadURL(ref(storage, ruta));
export const borrarArchivo = (ruta) => deleteObject(ref(storage, ruta)).catch(() => {});

// ---------- Servidor (/api) ----------

async function api(ruta, datos) {
  const u = auth.currentUser;
  const r = await fetch('/api/' + ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(u ? { Authorization: 'Bearer ' + await u.getIdToken() } : {}) },
    body: JSON.stringify(datos || {})
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(json.error || 'Error del servidor'), { status: r.status });
  return json;
}

/** Crea el pago en Mercado Pago y devuelve la URL a la que hay que ir. */
export const crearPago = (cursoId) => api('crear-pago', { curso: cursoId });
/** Revisa un pago al volver de Mercado Pago (por si la confirmación automática aún no llega). */
export const confirmarPago = (pagoId) => api('confirmar-pago', { pago: pagoId });
/** Enlace temporal para ver un video o descargar un material del curso. */
export const enlaceArchivo = (cursoId, ruta) => api('archivo', { curso: cursoId, ruta });
