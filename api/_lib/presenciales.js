/* Clases presenciales para cobrarlas: lo guardado en el panel (sitio/presenciales)
   o, si Daniela nunca lo cambió, los valores originales de assets/js/datos.js. */
import fs from 'node:fs';
import vm from 'node:vm';
import { db } from './firebase.js';

let originales;
function presencialesOriginales() {
  // datos.js es un script del navegador: se evalúa aparte y se toma solo NM.PRESENCIALES.
  originales ||= vm.runInNewContext(fs.readFileSync(new URL('../../assets/js/datos.js', import.meta.url), 'utf8') + '\nNM', {}).PRESENCIALES;
  return originales;
}

/** Clase visible por id, o null. */
export async function clasePresencial(id) {
  const d = await db.doc('sitio/presenciales').get();
  const lista = (d.exists && d.data().lista) || presencialesOriginales();
  return lista.find(c => c.id === id && c.visible !== false) || null;
}

/** Página pública de la clase (las originales tienen la suya). */
export const enlaceClase = (c) => c.pagina || 'clase?id=' + encodeURIComponent(c.id);
