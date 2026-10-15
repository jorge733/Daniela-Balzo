/* POST /api/archivo { curso, ruta } -> { url }
   Enlace temporal a un video o material, solo si quien lo pide compró el curso. */
import { db, bucket, usuarioDe, EMULADOR } from './_lib/firebase.js';
import { json, error, cuerpo } from './_lib/util.js';

const HORAS = 4;

async function enlace(ruta) {
  const archivo = bucket.file(ruta);
  if (EMULADOR) {
    // El emulador no firma URLs: se usa un token de descarga.
    const [meta] = await archivo.getMetadata();
    let token = meta.metadata?.firebaseStorageDownloadTokens;
    if (!token) {
      token = crypto.randomUUID();
      await archivo.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
    }
    return `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket.name}/o/${encodeURIComponent(ruta)}?alt=media&token=${token}`;
  }
  const [url] = await archivo.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + HORAS * 3600 * 1000 });
  return url;
}

export async function POST(request) {
  const usuario = await usuarioDe(request);
  if (!usuario) return error('Inicia sesión.', 401);
  const { curso, ruta } = await cuerpo(request);
  if (typeof curso !== 'string' || typeof ruta !== 'string') return error('Datos inválidos.');

  const [acceso, admin, doc] = await Promise.all([
    db.collection('accesos').doc(usuario.uid).get(),
    db.collection('admins').doc(usuario.uid).get(),
    db.collection('cursos').doc(curso).get()
  ]);
  if (!admin.exists && !acceso.data()?.cursos?.[curso]) return error('No tienes acceso a este curso.', 403);
  if (!doc.exists) return error('El curso no existe.', 404);

  // La ruta tiene que ser un video o material de ese mismo curso.
  const c = doc.data();
  const valida = (c.lecciones || []).some(l => l.video === ruta) || (c.materiales || []).some(m => m.ruta === ruta);
  if (!valida || !ruta.startsWith(`cursos/${curso}/`)) return error('Archivo no encontrado.', 404);

  try {
    return json({ url: await enlace(ruta) });
  } catch (e) {
    console.error('archivo', ruta, e);
    return error('No se pudo abrir el archivo.', 502);
  }
}
