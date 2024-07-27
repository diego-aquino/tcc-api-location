import fastify from 'fastify';
import type { LiteralHttpServiceSchemaPath } from 'zimic/http';
import { z } from 'zod';

import api from '@/clients/api';
import { pickDefinedProperties } from '@/utils/data';

import { environment } from '../config/environment';
import { LocationOperations, LocationSchema } from '../types/generated';
import { City } from '../types/locations';
import { calculateDistanceByCoordinates } from '../utils/distances';
import { DEFAULT_PUBLIC_CACHE_CONTROL_HEADER } from './cache';
import { handleServerError, NotFoundError } from './errors';

const app = fastify({
  logger: true,
  disableRequestLogging: environment.NODE_ENV !== 'development',
  pluginTimeout: 0,
});

type LocationPath = LiteralHttpServiceSchemaPath<LocationSchema>;

const searchCitiesSchema = z.object({
  query: z.string().min(1),
});

app.get('/cities' satisfies LocationPath, async (request, reply) => {
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
  originCityId: z.string().min(1),
  destinationCityId: z.string().min(1),
});

app.get('/cities/distances' satisfies LocationPath, async (request, reply) => {
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

app.setErrorHandler(handleServerError);

export default app;
