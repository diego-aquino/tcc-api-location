import path from 'path';

import { environment } from './environment';

export const ROOT_DIRECTORY =
  environment.NODE_ENV === 'production' ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
