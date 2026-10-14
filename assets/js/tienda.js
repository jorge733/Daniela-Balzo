/* Ficha de un curso online y compra con Mercado Pago.
   El acceso lo activa el servidor cuando Mercado Pago confirma el pago. */
import * as nube from './nube.js';

const { esc, clp } = NM;
const id = new URLSearchParams(location.search).get('id');
const main = document.getElementById('contenido');
const $ = (x) => document.getElementById(x);

const [curso, usuario] = await Promise.all([id ? nube.curso(id) : null, nube.usuarioListo()]);

if (!curso || !curso.publicado) {
  main.innerHTML = `<section class="banda"><div class="wrap centro"><h1>Curso no encontrado</h1>
    <p>Puede que ya no esté disponible.</p><a class="btn" href="cursos-online.html">Ver cursos online</a></div></section>`;
} else {
  document.title = curso.titulo + ' | Daniela Balzo · Negra Mora';
  let tiene = usuario ? (await nube.misCursos(usuario)).includes(curso.id) : false;

  const pintar = () => {
    main.innerHTML = `
    <section class="banda banda-lila">
      <div class="wrap dos">
        <div>
          <span class="etiqueta">Curso online · Nivel ${NM.nivel(curso).nombre.toLowerCase()} · ${curso.lecciones.length} clases en video</span>
          <h1>${esc(curso.titulo)}</h1>
          <p>${esc(curso.resumen)}</p>
          <div class="pie-tarjeta" style="justify-content: flex-start; gap: 20px">
            <span class="precio" style="font-size: 2rem">${tiene ? 'Ya es tuyo' : clp(curso.precio)}</span>
            ${tiene
              ? `<a class="btn" href="aula.html?curso=${encodeURIComponent(curso.id)}">Ir a mis cursos</a>`
              : `<button class="btn" id="comprar" type="button">Comprar curso</button>`}
          </div>
          <p class="nota" style="margin-top: 12px">Pago único. Acceso a los videos y materiales cuando quieras.</p>
          ${new URLSearchParams(location.search).get('pago') === 'error'
            ? '<p class="error" style="margin-top: 12px">El pago no se completó. No se cobró nada; puedes intentarlo otra vez.</p>' : ''}
        </div>
        <img class="foto" src="${esc(NM.imagen(curso))}" alt="">
      </div>
    </section>
    <section class="banda">
      <div class="wrap dos" style="align-items: start">
        <div>
          <h2>Qué vas a aprender</h2>
          <ol class="linea-tiempo">
            ${curso.lecciones.map((l, i) => `<li><b>Clase ${i + 1}</b><span>${esc(l.titulo)}${l.duracion ? ` <span class="nota">· ${esc(l.duracion)}</span>` : ''}</span></li>`).join('')}
          </ol>
        </div>
        <div class="ficha">
          <h3>Incluye</h3>
          <ul>
            <li>${curso.lecciones.length} clases en video para ver cuando quieras</li>
            ${curso.materiales.map(m => `<li>${esc(m.nombre)}</li>`).join('')}
            <li>Consultas por WhatsApp mientras haces el curso</li>
          </ul>
          <h3 style="margin-top: 18px">Necesitas</h3>
          <p>${curso.requisitos ? esc(curso.requisitos) : 'Una máquina de coser que funcione y materiales básicos de costura.'} ¿Dudas? <a href="contacto.html">Escríbeme</a>.</p>
        </div>
      </div>
    </section>`;
    const b = $('comprar');
    if (b) b.addEventListener('click', abrir);
  };

  // ---------- Compra ----------
  const modal = $('modal');
  let modoEntrar = false;

  function abrir() {
    const u = nube.usuarioActual();
    $('m-curso').textContent = curso.titulo;
    $('m-precio').textContent = clp(curso.precio);
    $('campos-cuenta').hidden = !!u;
    $('m-ya-cuenta').textContent = u ? `Comprarás con tu cuenta ${u.email}.` : '';
    $('m-error').textContent = '';
    cambiarModo(false);
    $('paso-cuenta').hidden = false;
    $('paso-pagando').hidden = true;
    modal.hidden = false;
    (u ? modal.querySelector('.mp') : $('m-nombre')).focus();
  }

  // Alterna entre "crear cuenta" y "ya tengo cuenta"
  function cambiarModo(entrar) {
    modoEntrar = entrar;
    $('m-campo-nombre').hidden = entrar;
    $('m-nombre').required = !entrar && !nube.usuarioActual();
    $('m-clave').autocomplete = entrar ? 'current-password' : 'new-password';
    $('m-etiqueta-clave').firstChild.textContent = entrar ? 'Contraseña' : 'Crea una contraseña';
    $('m-modo').textContent = entrar ? '¿Primera vez? Crea tu cuenta' : '¿Ya tienes cuenta? Entra aquí';
    $('m-olvide').hidden = !entrar;
  }
  $('m-modo').onclick = () => { cambiarModo(!modoEntrar); $('m-error').textContent = ''; };
  $('m-olvide').onclick = async () => {
    const correo = $('m-correo').value.trim();
    if (!correo) { $('m-error').textContent = 'Escribe tu correo y vuelve a hacer clic.'; return; }
    try { await nube.recuperarClave(correo); } catch (e) {}
    $('m-error').textContent = 'Si ese correo tiene cuenta, te llegará un enlace para crear una contraseña nueva.';
  };

  const cerrar = () => { modal.hidden = true; };
  modal.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = cerrar);
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

  $('paso-cuenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = modal.querySelector('.mp');
    boton.disabled = true;
    $('m-error').textContent = '';
    try {
      let u = nube.usuarioActual();
      if (!u) {
        const correo = $('m-correo').value.trim();
        const clave = $('m-clave').value;
        u = modoEntrar ? await nube.entrar(correo, clave) : await nube.crearCuenta($('m-nombre').value.trim(), correo, clave);
      }
      if ((await nube.misCursos(u)).includes(curso.id)) { tiene = true; cerrar(); pintar(); return; }
      $('paso-cuenta').hidden = true;
      $('paso-pagando').hidden = false;
      const { url } = await nube.crearPago(curso.id);
      location.href = url;
    } catch (err) {
      $('paso-cuenta').hidden = false;
      $('paso-pagando').hidden = true;
      if (err.code === 'auth/email-already-in-use') cambiarModo(true);
      $('m-error').textContent = err.code ? nube.mensajeError(err) : (err.message || 'No pudimos conectar con Mercado Pago. Intenta de nuevo.');
    } finally {
      boton.disabled = false;
    }
  });

  pintar();
}
