/* Da acceso al panel a una cuenta que ya existe en Firebase Authentication.
   Uso (proyecto real): FIREBASE_SERVICE_ACCOUNT="$(cat cuenta.json)" node scripts/crear-admin.mjs correo@ejemplo.cl
   Uso (emuladores):    npm run admin -- correo@ejemplo.cl */
const args = process.argv.slice(2);
if (args.includes('--emuladores')) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
  process.env.GCLOUD_PROJECT ||= 'demo-negramora';
}
const correo = args.find(a => !a.startsWith('--'));
if (!correo) {
  console.error('Indica el correo: node scripts/crear-admin.mjs correo@ejemplo.cl');
  process.exit(1);
}
const { auth, db } = await import('../api/_lib/firebase.js');
const u = await auth.getUserByEmail(correo);
await db.doc(`admins/${u.uid}`).set({ correo: u.email, creado: new Date() });
await db.doc('sitio/textos').set({}, { merge: true }); // para que el sitio pueda leer los textos desde el primer día
console.log(`Listo: ${u.email} ya puede entrar al panel.`);
process.exit(0);
