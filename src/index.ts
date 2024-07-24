import { environment } from './config/environment';
import server from './server/server';
import { loadServerSwagger } from './server/swagger';

const isServerless = environment.PORT === undefined;

async function startServer() {
  await loadServerSwagger();

  await server.listen({
    host: '0.0.0.0',
    port: environment.PORT,
  });
}

if (!isServerless) {
  void startServer().catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
}

async function serverlessHandler(request: Request, response: Response) {
  await loadServerSwagger();
  await server.ready();

  server.server.emit('request', request, response);
}

export default serverlessHandler;
