/* Lectura de datos públicos (cursos y patrones publicados) con la API REST de Firestore.
   Evita cargar el SDK de Firebase en las páginas que solo muestran el catálogo. */
import { FIREBASE, EMULADORES } from './config.js';

const BASE = (EMULADORES ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com') +
  `/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;

// Convierte un valor de la API REST ({stringValue: 'x'}, {arrayValue: ...}) en JS normal.
function valor(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(valor);
  if ('mapValue' in v) return campos(v.mapValue.fields || {});
  return null;
}
const campos = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, valor(v)]));

// Cursos y patrones viven en la misma colección; los patrones llevan tipo "patron".
export const cursosPublicados = async () => (await publicados()).filter(c => !NM.esPatron(c));
export const patronesPublicados = async () => (await publicados()).filter(NM.esPatron);

async function publicados() {
  const r = await fetch(BASE + ':runQuery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'cursos' }],
      where: { fieldFilter: { field: { fieldPath: 'publicado' }, op: 'EQUAL', value: { booleanValue: true } } }
    } })
  });
  if (!r.ok) return [];
  return NM.ordenarCursos((await r.json())
    .filter(x => x.document)
    .map(x => ({ id: x.document.name.split('/').pop(), lecciones: [], materiales: [], ...campos(x.document.fields || {}) })));
}
