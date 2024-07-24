import { NotFoundError } from '@/server/errors';

export class LookupPlaceNotFoundError extends NotFoundError {
  constructor(lookupId: string) {
    super(`Place identified by '${lookupId}' not found`);
    this.name = 'LookupPlaceNotFoundError';
  }
}
