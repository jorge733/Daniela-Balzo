/* Vista previa al compartir (WhatsApp, Facebook, Instagram, X).
   1. Genera assets/img/compartir.jpg (1200x630) desde scripts/tarjeta-compartir.html con Chrome.
   2. Agrega o actualiza las etiquetas Open Graph de cada página con su título y descripción.
   Uso: node scripts/vista-previa.mjs [https://dominio]   (al cambiar de dominio, vuelve a correrlo) */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv.slice(2).find(a => !a.startsWith('--')) || 'https://daniela-balzo.vercel.app').replace(/\/$/, '');
const IMAGEN = 'assets/img/compartir.jpg';
const NO_COMPARTIR = ['404.html', 'panel.html'];

// ---------- 1. Imagen ----------
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
];
const chrome = (await Promise.all(CHROME.map(c => fs.access(c).then(() => c, () => null)))).find(Boolean);
if (process.argv.includes('--sin-imagen') || !chrome) {
  if (!chrome) console.log('No encontré Chrome: dejo la imagen actual.');
} else {
  const png = path.join(RAIZ, 'scripts', '.compartir.png');
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
    '--window-size=1200,630', '--virtual-time-budget=4000', `--screenshot=${png}`,
    'file:///' + path.join(RAIZ, 'scripts', 'tarjeta-compartir.html').replace(/\\/g, '/')], { stdio: 'ignore' });
  // JPG liviano: WhatsApp no muestra imágenes de más de ~300 KB
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '4', path.join(RAIZ, IMAGEN)]);
  await fs.rm(png);
  console.log(`Imagen: ${IMAGEN} (${Math.round((await fs.stat(path.join(RAIZ, IMAGEN))).size / 1024)} KB)`);
}

// ---------- 2. Etiquetas ----------
const atributo = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const desescapar = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const paginas = (await fs.readdir(RAIZ)).filter(f => f.endsWith('.html') && !NO_COMPARTIR.includes(f));
for (const archivo of paginas) {
  const ruta = path.join(RAIZ, archivo);
  let html = await fs.readFile(ruta, 'utf8');
  const titulo = desescapar((html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'Daniela Balzo · Negra Mora');
  const desc = desescapar((html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || 'Clases de costura personalizadas desde 2012.');
  const url = BASE + '/' + (archivo === 'index.html' ? '' : archivo.replace(/\.html$/, ''));
  const bloque = `<!-- vista-previa -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Daniela Balzo · Negra Mora">
<meta property="og:locale" content="es_CL">
<meta property="og:title" content="${atributo(titulo)}">
<meta property="og:description" content="${atributo(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}/${IMAGEN}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Daniela Balzo, Negra Mora: clases de costura">
<meta name="twitter:card" content="summary_large_image">
<!-- /vista-previa -->`;
  html = html.includes('<!-- vista-previa -->')
    ? html.replace(/<!-- vista-previa -->[\s\S]*?<!-- \/vista-previa -->/, bloque)
    : html.replace(/(<meta name="description"[^>]*>\n)/, `$1${bloque}\n`);
  if (!html.includes('<!-- vista-previa -->')) html = html.replace('</title>\n', `</title>\n${bloque}\n`);
  await fs.writeFile(ruta, html);
}
console.log(`Etiquetas en ${paginas.length} páginas, con la dirección ${BASE}`);
