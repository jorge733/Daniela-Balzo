/* firebase-admin para las funciones del servidor.
   En Vercel usa la cuenta de servicio de FIREBASE_SERVICE_ACCOUNT (JSON o JSON en base64).
   En local (npm run dev) se conecta a los emuladores. */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const EMULADOR = !!process.env.FIRESTORE_EMULATOR_HOST;

function credenciales() {
  const crudo = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!crudo) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT');
  return JSON.parse(crudo.trim().startsWith('{') ? crudo : Buffer.from(crudo, 'base64').toString('utf8'));
}

if (!getApps().length) {
  if (EMULADOR) {
    const projectId = process.env.GCLOUD_PROJECT || 'demo-negramora';
    initializeApp({ projectId, storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com` });
  } else {
    const cuenta = credenciales();
    initializeApp({
      credential: cert(cuenta),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${cuenta.project_id}.firebasestorage.app`
    });
  }
}

export const auth = getAuth();
export const db = getFirestore();
export const bucket = getStorage().bucket();

/** Usuario de la sesión según el token "Authorization: Bearer ..." o null. */
export async function usuarioDe(request) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!token) return null;
  try { return await auth.verifyIdToken(token); } catch (e) { return null; }
}
