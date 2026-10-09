# Daniela Balzo · Negra Mora

Prototipo del nuevo sitio web de **Daniela Balzo** (Negra Mora Diseños): clases de costura, portafolio y venta de cursos online. Reemplaza el sitio de Wix ([danibalzog.wixsite.com/misitio](https://danibalzog.wixsite.com/misitio)) manteniendo su diseño, textos y fotos.

## Qué incluye

| Sección | Páginas |
| --- | --- |
| Sitio actual (migrado desde Wix) | `index.html`, `quien-soy.html`, `talleres.html`, `cursos.html`, `clases-online.html`, `clases-grupales.html`, `clases-domicilio.html`, `vestuario.html`, `accesorios.html`, `ilustracion-textil.html`, `arte-terapia.html`, `contacto.html` |
| Venta de cursos online | `cursos-online.html` (catálogo), `curso.html?id=…` (ficha y compra) |
| Aula de alumnas | `aula.html` (inicio de sesión, mis cursos, clases en video, avance) |
| Panel de Daniela | `panel.html` (cursos, clases y videos, textos de la página, ventas) |

## Cómo verlo

Es un sitio estático, sin instalación. Ábrelo con cualquier servidor local, por ejemplo:

```bash
npx http-server . -p 5173
```

y entra a http://localhost:5173.

## Estado del prototipo

- **Pago simulado:** el botón "Pagar con Mercado Pago" no cobra nada; simula la compra y da acceso al curso.
- **Datos locales:** cuentas, compras, avance y cambios del panel se guardan en el navegador (`localStorage`). En el panel está el botón "Restablecer datos de prueba".
- **Videos y materiales de ejemplo:** el reproductor muestra un espacio reservado.
- Los cursos online, sus precios y sus clases son de ejemplo, basados en los talleres que Daniela ya ofrece.

## Próximos pasos (versión final)

1. Cuentas de alumnas y del panel con Firebase Authentication.
2. Cursos, ventas y avance en Firestore; videos protegidos y materiales en almacenamiento privado.
3. Checkout real de Mercado Pago con confirmación automática del pago (webhook) y correo de bienvenida.
4. Términos y condiciones y política de privacidad.
5. Publicación en Vercel con el dominio de Daniela.

## Estructura

```
assets/
  css/styles.css     Estilos (paleta y tipografía del sitio original)
  img/               Fotos del sitio de Wix, optimizadas para web
  js/datos.js        Textos, cursos de ejemplo y guardado local
  js/layout.js       Encabezado, menú, pie y botón de WhatsApp
  js/galerias.js     Galerías con visor de fotos
  js/tienda.js       Ficha de curso y compra simulada
  js/aula.js         Aula virtual
  js/panel.js        Panel de administración
```

Desarrollado por [BenedettoWebs](https://benedettowebs.vercel.app) · Santiago Benedetto.
