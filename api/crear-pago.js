/* POST /api/crear-pago { curso } -> { url }
   Crea el pago en Mercado Pago con el precio guardado en Firestore (no el del navegador). */
import { db, usuarioDe } from './_lib/firebase.js';
import { crearPreferencia } from './_lib/mercadopago.js';
import { json, error, cuerpo, sitio } from './_lib/util.js';

export async function POST(request) {
  const usuario = await usuarioDe(request);
  if (!usuario) return error('Inicia sesión para comprar.', 401);

  const { curso: id } = await cuerpo(request);
  if (typeof id !== 'string' || !id) return error('Falta el curso.');
  const doc = await db.collection('cursos').doc(id).get();
  if (!doc.exists || !doc.data().publicado) return error('Este curso no está disponible.', 404);
  const curso = { id, ...doc.data() };
  if (!(curso.precio > 0)) return error('Este curso no tiene precio.');

  const acceso = await db.collection('accesos').doc(usuario.uid).get();
  if (acceso.exists && acceso.data().cursos?.[id]) return error('Ya tienes este curso.', 409);

  try {
    const url = await crearPreferencia({ curso, usuario, base: sitio(request) });
    return json({ url });
  } catch (e) {
    console.error('crear-pago', e);
    return error('No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.', 502);
  }
}
