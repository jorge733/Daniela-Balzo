/* POST /api/crear-pago -> { url }
   Curso online:      { curso }  (con sesión iniciada; da acceso al aula)
   Clase presencial:  { clase, nombre, correo, telefono, nota }  (sin cuenta; queda como inscripción)
   El precio siempre sale de Firestore o de los valores originales, nunca del navegador. */
import { FieldValue } from 'firebase-admin/firestore';
import { db, usuarioDe } from './_lib/firebase.js';
import { crearPreferencia } from './_lib/mercadopago.js';
import { clasePresencial, enlaceClase } from './_lib/presenciales.js';
import { json, error, cuerpo, sitio } from './_lib/util.js';

const texto = (v, max) => String(v ?? '').trim().slice(0, max);

export async function POST(request) {
  const datos = await cuerpo(request);
  if (datos.clase) return pagarClase(request, datos);

  const usuario = await usuarioDe(request);
  if (!usuario) return error('Inicia sesión para comprar.', 401);

  const { curso: id } = datos;
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

async function pagarClase(request, datos) {
  if (typeof datos.clase !== 'string') return error('Falta la clase.');
  const clase = await clasePresencial(datos.clase);
  if (!clase) return error('Esta clase no está disponible.', 404);
  if (!(clase.precio > 0)) return error('Esta clase no tiene precio fijo. Escríbele a Daniela para coordinarla.');

  const nombre = texto(datos.nombre, 100);
  const correo = texto(datos.correo, 150).toLowerCase();
  const telefono = texto(datos.telefono, 30);
  if (!nombre) return error('Escribe tu nombre.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return error('Revisa que el correo esté bien escrito.');
  if (telefono.replace(/\D/g, '').length < 8) return error('Escribe tu teléfono para que Daniela pueda coordinar contigo.');

  // La inscripción queda pendiente hasta que Mercado Pago confirme el pago.
  const inscripcion = db.collection('inscripciones').doc();
  await inscripcion.set({
    estado: 'pendiente', creada: FieldValue.serverTimestamp(),
    clase: clase.id, titulo: clase.titulo, precio: clase.precio, volver: enlaceClase(clase),
    nombre, correo, telefono, nota: texto(datos.nota, 500)
  });

  try {
    const url = await crearPreferencia({ clase, inscripcion: inscripcion.id, nombre, correo, base: sitio(request) });
    return json({ url });
  } catch (e) {
    console.error('crear-pago clase', e);
    return error('No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.', 502);
  }
}
