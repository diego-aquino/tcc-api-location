import fastify from 'fastify';
import { z } from 'zod';

import { pickDefinedProperties } from '@/utils/data';

import { environment } from '../config/environment';
import HereClient from '../services/here/HereClient';
import { LocationOperations } from '../types/generated';
import { City } from '../types/locations';
import { calculateDistanceByCoordinates } from '../utils/distances';
import { handleServerError, NotFoundError } from './errors';

const DEFAULT_CACHE_CONTROL_MAX_AGE = 60 * 60 * 24; // 1 day
const DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE = 60; // 1 minute

const DEFAULT_PUBLIC_CACHE_CONTROL_HEADER =
  environment.NODE_ENV === 'production'
    ? [
        'public',
        `max-age=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
        `s-maxage=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
        `stale-while-revalidate=${DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE}`,
      ].join(', ')
    : undefined;

const api = {
  here: new HereClient(),
};

const server = fastify({
  logger: true,
  disableRequestLogging: environment.NODE_ENV !== 'development',
});

const searchCitiesSchema = z.object({
  query: z.string(),
});

server.get('/cities', async (request, reply) => {
  const { query } = searchCitiesSchema.parse(
    request.query,
  ) satisfies LocationOperations['cities/search']['request']['searchParams'];

  const hereCities = await api.here.searchCities(query);

  const cities = hereCities.map(
    (city): City => ({
      id: city.id,
      name: city.address.city,
      stateName: city.address.state,
      stateCode: city.address.stateCode,
      countryName: city.address.countryName,
      countryCode: city.address.countryCode,
    }),
  );

  return reply
    .headers(pickDefinedProperties({ 'cache-control': DEFAULT_PUBLIC_CACHE_CONTROL_HEADER }))
    .status(200)
    .send(cities satisfies LocationOperations['cities/search']['response']['200']['body']);
});

const getDistanceBetweenCitiesSchema = z.object({
  originCityId: z.string(),
  destinationCityId: z.string(),
});

server.get('/cities/distances', async (request, reply) => {
  const { originCityId, destinationCityId } = getDistanceBetweenCitiesSchema.parse(
    request.query,
  ) satisfies LocationOperations['cities/distances/get']['request']['searchParams'];

  const [originCity, destinationCity] = await Promise.all([
    api.here.lookupById(originCityId),
    api.here.lookupById(destinationCityId),
  ]);

  const originPosition = originCity.position;
  const destinationPosition = destinationCity.position;

  if (!originPosition) {
    throw new NotFoundError('Could not find the coordinates of the origin city');
  }
  if (!destinationPosition) {
    throw new NotFoundError('Could not find the coordinates of the destination city');
  }

  const distanceInKilometers = calculateDistanceByCoordinates(
    { latitude: originPosition.lat, longitude: originPosition.lng },
    { latitude: destinationPosition.lat, longitude: destinationPosition.lng },
  );

  return reply
    .headers(pickDefinedProperties({ 'cache-control': DEFAULT_PUBLIC_CACHE_CONTROL_HEADER }))
    .status(200)
    .send({
      kilometers: distanceInKilometers,
    } satisfies LocationOperations['cities/distances/get']['response']['200']['body']);
});

server.setErrorHandler(handleServerError);

export default server;
