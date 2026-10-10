/* Configuración de Firebase y del modo de prueba.
   Al crear el proyecto real, pega aquí los datos de "Configuración del proyecto > Tus apps"
   en la consola de Firebase. En localhost el sitio usa siempre los emuladores. */

const PRODUCCION = {
  apiKey: 'AIzaSyDnwwzkxUP9jcPHCPJ4aIwzL76JZfilBe0',
  authDomain: 'mora-82b69.firebaseapp.com',
  projectId: 'mora-82b69',
  storageBucket: 'mora-82b69.firebasestorage.app',
  messagingSenderId: '951600126424',
  appId: '1:951600126424:web:bbe71a9d653d8a8c627aad'
};

const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

export const EMULADORES = LOCAL;

export const FIREBASE = LOCAL
  ? { apiKey: 'demo', authDomain: 'demo-negramora.firebaseapp.com', projectId: 'demo-negramora', storageBucket: 'demo-negramora.appspot.com' }
  : PRODUCCION;
