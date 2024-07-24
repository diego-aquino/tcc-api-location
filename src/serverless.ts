import server from '@/server/server';
import { loadServerSwagger } from '@/server/swagger';

void loadServerSwagger();

async function serverlessHandler(request: Request, response: Response) {
  await server.ready();

  server.server.emit('request', request, response);
}

export default serverlessHandler;
