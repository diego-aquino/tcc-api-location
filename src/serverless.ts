import server from '@/server/server';
import { loadServerSwagger } from '@/server/swagger';

async function serverlessHandler(request: Request, response: Response) {
  await loadServerSwagger();
  await server.ready();

  server.server.emit('request', request, response);
}

export default serverlessHandler;
