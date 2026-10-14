/* Servidor local: sirve el sitio y las funciones de /api igual que Vercel,
   conectadas a los emuladores de Firebase.  Uso: npm run dev  (con npm run emuladores en otra terminal) */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = Number(process.env.PORT) || 5173;

process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199';
process.env.GCLOUD_PROJECT ||= 'demo-negramora';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml'
};

async function api(req, res, nombre) {
  if (!/^[a-z0-9-]+$/.test(nombre)) return enviar(res, 404, 'No encontrado');
  let modulo;
  try { modulo = await import(pathToFileURL(path.join(RAIZ, 'api', nombre + '.js')).href); }
  catch (e) { return enviar(res, 404, 'No encontrado'); }
  const fn = modulo[req.method];
  if (!fn) return enviar(res, 405, 'Método no permitido');

  const trozos = [];
  for await (const t of req) trozos.push(t);
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(trozos)
  });
  try {
    const r = await fn(request);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error(e);
    enviar(res, 500, 'Error en ' + nombre);
  }
}

function enviar(res, status, texto) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(texto);
}

http.createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.startsWith('/api/')) return api(req, res, ruta.slice(5));

  // Direcciones sin .html, como en Vercel (cleanUrls)
  if (ruta.endsWith('.html')) {
    const limpia = ruta === '/index.html' ? '/' : ruta.slice(0, -5);
    res.writeHead(308, { Location: limpia + new URL(req.url, 'http://x').search });
    return res.end();
  }
  const archivo = path.join(RAIZ, ruta.endsWith('/') ? ruta + 'index.html' : path.extname(ruta) ? ruta : ruta + '.html');
  if (!archivo.startsWith(RAIZ) || /[\\/](scripts|node_modules|api)[\\/]|[\\/]\./.test(archivo.slice(RAIZ.length))) {
    return enviar(res, 404, 'No encontrado');
  }
  try {
    const datos = await fs.readFile(archivo);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(datos);
  } catch (e) {
    const nf = await fs.readFile(path.join(RAIZ, '404.html')).catch(() => 'No encontrado');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(nf);
  }
}).listen(PUERTO, () => console.log(`Sitio en http://localhost:${PUERTO}`));
