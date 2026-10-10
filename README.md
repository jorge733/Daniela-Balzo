# Daniela Balzo · Negra Mora

Prototipo del nuevo sitio web de **Daniela Balzo** (Negra Mora Diseños): clases de costura, portafolio y venta de cursos online. Reemplaza el sitio de Wix ([danibalzog.wixsite.com/misitio](https://danibalzog.wixsite.com/misitio)) manteniendo su diseño, textos y fotos.

## Qué incluye

| Sección | Páginas |
| --- | --- |
| Sitio actual (migrado desde Wix) | `index.html`, `quien-soy.html`, `talleres.html`, `cursos.html`, `clases-online.html`, `clases-grupales.html`, `clases-domicilio.html`, `vestuario.html`, `accesorios.html`, `ilustracion-textil.html`, `arte-terapia.html`, `contacto.html` |
| Venta de cursos online | `cursos-online.html` (catálogo), `curso.html?id=…` (ficha, cuenta y pago con Mercado Pago) |
| Aula de alumnas | `aula.html` (inicio de sesión, mis cursos, videos, materiales y avance) |
| Panel de Daniela | `panel.html` (cursos, subida de videos y materiales, textos de la página, ventas) |
| Legal y errores | `terminos.html`, `privacidad.html` (borradores), `404.html` |

## Cómo funciona

- **Sitio estático** (HTML, CSS y JS sin compilar) publicado en Vercel.
- **Firebase Authentication**: cuentas de alumnas y de Daniela (correo y contraseña, recuperación por correo).
- **Firestore**: cursos, textos editables, accesos, avance y ventas. Las reglas están en `firestore.rules`.
- **Firebase Storage**: videos y materiales. Solo Daniela sube; las alumnas los ven con un enlace temporal (4 horas) que entrega `/api/archivo` después de revisar que compraron el curso. Reglas en `storage.rules`.
- **Vercel Functions** (`/api`): crean el pago en Mercado Pago, reciben la notificación (webhook), confirman el pago al volver y firman los enlaces de los videos. Las compras solo las escribe el servidor.

## Probarlo en local

Necesita Node 24, Java 21 (para los emuladores) y `firebase-tools`.

```bash
npm install
npm run emuladores   # terminal 1: Auth, Firestore y Storage en local (UI en http://localhost:4000)
npm run sembrar      # una vez: cursos de ejemplo y cuentas de prueba
npm run dev          # terminal 2: sitio y /api en http://localhost:5173
```

Cuentas de prueba (solo existen en los emuladores): `panel@prueba.test` y `alumna@prueba.test`, contraseña `prueba123`.
Sin credenciales de Mercado Pago, el pago se simula con `/api/simular-pago` (solo funciona con emuladores).

## Para publicar

1. Crear el proyecto en Firebase y activar Authentication (correo/contraseña), Firestore y Storage (Storage requiere el plan Blaze; poner una alerta de presupuesto).
2. Pegar la configuración web en `assets/js/config.js` y publicar las reglas: `firebase deploy --only firestore:rules,storage --project <id>`.
3. En Vercel, cargar las variables de `.env.example` (cuenta de servicio, credenciales de Mercado Pago, clave del webhook y `SITE_URL`).
4. En Mercado Pago, configurar el webhook a `https://<dominio>/api/webhook-mp` (evento "Pagos").
5. Crear la cuenta de Daniela en Authentication y darle acceso al panel con `scripts/crear-admin.mjs`.
6. Con el dominio ya conectado, actualizar la vista previa al compartir: `node scripts/vista-previa.mjs https://<dominio>` (necesita Chrome y ffmpeg para regenerar la imagen; con `--sin-imagen` solo cambia las direcciones).
7. Cambiar `MODO_PRUEBA` a `false` en `assets/js/datos.js`, completar lo marcado como pendiente en `terminos.html` y `privacidad.html` y conectar el dominio.

## Estructura

```
api/                   Funciones de Vercel (Mercado Pago y enlaces de archivos)
  _lib/                firebase-admin, Mercado Pago y utilidades
assets/
  css/styles.css       Estilos (paleta y tipografía del sitio original)
  img/                 Fotos del sitio de Wix, optimizadas para web
  js/config.js         Configuración de Firebase (emuladores en localhost)
  js/datos.js          Contacto, textos por defecto y utilidades
  js/nube.js           Conexión con Firebase (cuentas, cursos, archivos, /api)
  js/publico.js        Catálogo público vía API REST (sin cargar Firebase)
  js/layout.js         Encabezado, menú, pie, botón de WhatsApp y textos editables
  js/galerias.js       Galerías con visor de fotos
  js/tienda.js         Ficha de curso y compra
  js/aula.js           Aula virtual
  js/panel.js          Panel de administración
scripts/               Servidor local, datos de prueba y alta de administradoras
firestore.rules        Reglas de la base de datos
storage.rules          Reglas de los archivos
```

Desarrollado por [BenedettoWebs](https://benedettowebs.vercel.app) · Santiago Benedetto.
