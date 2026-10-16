// Función de Vercel: toda la API de Nest corre aquí. Usa el código ya
// compilado por `nest build` (dist/), que resuelve los alias @app/...
const { createApp } = require('../dist/app.factory');

// La app se crea una sola vez por instancia y se reutiliza entre peticiones
let server;

const getServer = async () => {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance();
};

module.exports = async (req, res) => {
  if (!server) {
    server = getServer().catch((error) => {
      // Si falla el arranque, la próxima petición lo intenta de nuevo
      server = undefined;
      throw error;
    });
  }
  const app = await server;
  return app(req, res);
};
