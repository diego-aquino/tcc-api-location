import { environment } from './config/environment';
import server from './server';

if (environment.NODE_ENV === 'development') {
  void server.listen({
    host: '0.0.0.0',
    port: environment.PORT,
  });
}

async function handler(request: Request, response: Response) {
  await server.ready();
  server.server.emit('request', request, response);
}

export default handler;
