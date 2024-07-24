import { AxiosError } from 'axios';
import fastify from 'fastify';
import { z } from 'zod';

import { environment } from '../config/environment';
import HereClient from '../services/here/HereClient';
import { LocationOperations } from '../types/generated';
import { City } from '../types/locations';
import { calculateDistanceByCoordinates } from '../utils/distances';
import { handleServerError } from './errors';

const server = fastify({
  logger: true,
  disableRequestLogging: environment.NODE_ENV !== 'development',
});

const api = {
  here: new HereClient(),
};

const DEFAULT_CACHE_CONTROL_MAX_AGE = 60 * 60 * 24; // 1 day
const DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE = 60; // 1 minute

const DEFAULT_PUBLIC_CACHE_CONTROL_HEADER = [
  'public',
  `max-age=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
  `s-maxage=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
  `stale-while-revalidate=${DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE}`,
].join(', ');

const searchCitiesSchema = z.object({
  query: z.string(),
});

server.get('/cities', async (request, reply) => {
  const { query } = searchCitiesSchema.parse(
    request.query,
  ) satisfies LocationOperations['cities/search']['request']['searchParams'];

  const hereCities = await api.here.searchCities(query);

  const cities = hereCities.map<City>((city) => ({
    id: city.id,
    name: city.address.city,
    state: {
      name: city.address.state,
      code: city.address.stateCode,
    },
    country: {
      name: city.address.countryName,
      code: city.address.countryCode,
    },
  }));

  return reply
    .header('cache-control', DEFAULT_PUBLIC_CACHE_CONTROL_HEADER)
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

  const [originCityLookupResult, destinationCityLookupResult] = await Promise.allSettled([
    api.here.lookupById(originCityId),
    api.here.lookupById(destinationCityId),
  ]);

  if (originCityLookupResult.status === 'rejected') {
    if (originCityLookupResult.reason instanceof AxiosError && originCityLookupResult.reason.response?.status === 404) {
      return reply.status(404).send({
        message: 'Origin city not found',
      } satisfies LocationOperations['cities/distances/get']['response']['404']['body']);
    }
    throw originCityLookupResult.reason;
  }

  if (destinationCityLookupResult.status === 'rejected') {
    if (
      destinationCityLookupResult.reason instanceof AxiosError &&
      destinationCityLookupResult.reason.response?.status === 404
    ) {
      return reply.status(404).send({
        message: 'Destination city not found',
      } satisfies LocationOperations['cities/distances/get']['response']['404']['body']);
    }
    throw destinationCityLookupResult.reason;
  }

  const originCity = originCityLookupResult.value;
  const originPosition = originCity.position;

  const destinationCity = destinationCityLookupResult.value;
  const destinationPosition = destinationCity.position;

  if (!originPosition) {
    return reply.status(404).send({
      message: 'Could not find the coordinates of the origin city',
    } satisfies LocationOperations['cities/distances/get']['response']['404']['body']);
  }

  if (!destinationPosition) {
    return reply.status(404).send({
      message: 'Could not find the coordinates of the destination city',
    } satisfies LocationOperations['cities/distances/get']['response']['404']['body']);
  }

  const distanceInKilometers = calculateDistanceByCoordinates(
    { latitude: originPosition.lat, longitude: originPosition.lng },
    { latitude: destinationPosition.lat, longitude: destinationPosition.lng },
  );

  return reply
    .header('cache-control', DEFAULT_PUBLIC_CACHE_CONTROL_HEADER)
    .status(200)
    .send({
      kilometers: distanceInKilometers,
    } satisfies LocationOperations['cities/distances/get']['response']['200']['body']);
});

server.setErrorHandler(handleServerError);

export default server;
