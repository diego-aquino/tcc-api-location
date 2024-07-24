'use strict';

var zod = require('zod');
var axios = require('axios');
var fastify = require('fastify');
var fastifyStatic = require('@fastify/static');
var fastifySwagger = require('@fastify/swagger');
var fastifySwaggerUI = require('@fastify/swagger-ui');
var path = require('path');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var axios__default = /*#__PURE__*/_interopDefault(axios);
var fastify__default = /*#__PURE__*/_interopDefault(fastify);
var fastifyStatic__default = /*#__PURE__*/_interopDefault(fastifyStatic);
var fastifySwagger__default = /*#__PURE__*/_interopDefault(fastifySwagger);
var fastifySwaggerUI__default = /*#__PURE__*/_interopDefault(fastifySwaggerUI);
var path__default = /*#__PURE__*/_interopDefault(path);

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var environmentSchema = zod.z.object({
  NODE_ENV: zod.z.enum(["development", "test", "production"]).default("development"),
  PORT: zod.z.coerce.number().int().positive().optional(),
  HERE_GEOCODING_URL: zod.z.string().url(),
  HERE_LOOKUP_URL: zod.z.string().url(),
  HERE_API_KEY: zod.z.string()
});
var environment = environmentSchema.parse(process.env);
var HereClient = class {
  constructor() {
    this.api = {
      geocode: axios__default.default.create({
        baseURL: environment.HERE_GEOCODING_URL,
        params: { apiKey: environment.HERE_API_KEY },
        paramsSerializer: (params) => new URLSearchParams(params).toString()
      }),
      lookup: axios__default.default.create({
        baseURL: environment.HERE_LOOKUP_URL,
        params: { apiKey: environment.HERE_API_KEY },
        paramsSerializer: (params) => new URLSearchParams(params).toString()
      })
    };
  }
  searchCities(query) {
    return __async(this, null, function* () {
      const cities = yield this.geocode({
        q: query,
        types: ["city"]
      });
      return cities;
    });
  }
  geocode(params) {
    return __async(this, null, function* () {
      const response = yield this.api.geocode.get("/geocode", {
        params: __spreadValues({
          lang: ["pt"],
          limit: "10"
        }, params)
      });
      const items = response.data.items.map((item) => __spreadProps(__spreadValues({}, item), {
        id: this.encodePointId(item.id)
      }));
      return items;
    });
  }
  lookupById(pointId) {
    return __async(this, null, function* () {
      const decodedId = this.decodePointId(pointId);
      const response = yield this.api.lookup.get("/lookup", {
        params: {
          id: decodedId,
          lang: ["pt"]
        }
      });
      const point = response.data;
      return point;
    });
  }
  encodePointId(pointId) {
    return Buffer.from(pointId, "utf-8").toString("base64");
  }
  decodePointId(encodedPointId) {
    return Buffer.from(encodedPointId, "base64").toString("utf-8");
  }
};
var HereClient_default = HereClient;

// src/utils/math.ts
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// src/utils/distances.ts
var EARTH_RADIUS_IN_KILOMETERS = 6371;
function calculateDistanceByCoordinates(point, otherPoint) {
  const pointLatitudeInRadians = toRadians(point.latitude);
  const pointLongitudeInRadians = toRadians(point.longitude);
  const otherPointLatitudeInRadians = toRadians(otherPoint.latitude);
  const otherPointLongitudeInRadians = toRadians(otherPoint.longitude);
  const latitudeDifferenceInRadians = otherPointLatitudeInRadians - pointLatitudeInRadians;
  const longitudeDifferenceInRadians = otherPointLongitudeInRadians - pointLongitudeInRadians;
  const squaredHalfChordLength = Math.sin(latitudeDifferenceInRadians / 2) ** 2 + Math.cos(pointLatitudeInRadians) * Math.cos(otherPointLatitudeInRadians) * Math.sin(longitudeDifferenceInRadians / 2) ** 2;
  const centralAngleInRadians = 2 * Math.atan2(Math.sqrt(squaredHalfChordLength), Math.sqrt(1 - squaredHalfChordLength));
  const distanceInKilometers = EARTH_RADIUS_IN_KILOMETERS * centralAngleInRadians;
  return distanceInKilometers;
}
function handleServerError(error, _request, reply) {
  var _a;
  if (error instanceof zod.ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.issues
    });
  }
  if (error instanceof axios.AxiosError) {
    const formattedError = __spreadProps(__spreadValues({}, error.toJSON()), {
      data: (_a = error.response) == null ? void 0 : _a.data
    });
    server_default.log.error({
      message: "Request error",
      error: formattedError
    });
  } else {
    server_default.log.error({
      message: "Internal server error",
      error
    });
  }
  return reply.status(500).send({
    message: "Internal server error"
  });
}

// src/server/server.ts
var DEFAULT_CACHE_CONTROL_MAX_AGE = 60 * 60 * 24;
var DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE = 60;
var DEFAULT_PUBLIC_CACHE_CONTROL_HEADER = [
  "public",
  `max-age=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
  `s-maxage=${DEFAULT_CACHE_CONTROL_MAX_AGE}`,
  `stale-while-revalidate=${DEFAULT_CACHE_CONTROL_STALE_WHILE_REVALIDATE}`
].join(", ");
var api = {
  here: new HereClient_default()
};
var server = fastify__default.default({
  logger: true,
  disableRequestLogging: environment.NODE_ENV !== "development"
});
var searchCitiesSchema = zod.z.object({
  query: zod.z.string()
});
server.get("/cities", (request, reply) => __async(void 0, null, function* () {
  const { query } = searchCitiesSchema.parse(
    request.query
  );
  const hereCities = yield api.here.searchCities(query);
  const cities = hereCities.map((city) => ({
    id: city.id,
    name: city.address.city,
    state: {
      name: city.address.state,
      code: city.address.stateCode
    },
    country: {
      name: city.address.countryName,
      code: city.address.countryCode
    }
  }));
  return reply.header("cache-control", DEFAULT_PUBLIC_CACHE_CONTROL_HEADER).status(200).send(cities);
}));
var getDistanceBetweenCitiesSchema = zod.z.object({
  originCityId: zod.z.string(),
  destinationCityId: zod.z.string()
});
server.get("/cities/distances", (request, reply) => __async(void 0, null, function* () {
  var _a, _b;
  const { originCityId, destinationCityId } = getDistanceBetweenCitiesSchema.parse(
    request.query
  );
  const [originCityLookupResult, destinationCityLookupResult] = yield Promise.allSettled([
    api.here.lookupById(originCityId),
    api.here.lookupById(destinationCityId)
  ]);
  if (originCityLookupResult.status === "rejected") {
    if (originCityLookupResult.reason instanceof axios.AxiosError && ((_a = originCityLookupResult.reason.response) == null ? void 0 : _a.status) === 404) {
      return reply.status(404).send({
        message: "Origin city not found"
      });
    }
    throw originCityLookupResult.reason;
  }
  if (destinationCityLookupResult.status === "rejected") {
    if (destinationCityLookupResult.reason instanceof axios.AxiosError && ((_b = destinationCityLookupResult.reason.response) == null ? void 0 : _b.status) === 404) {
      return reply.status(404).send({
        message: "Destination city not found"
      });
    }
    throw destinationCityLookupResult.reason;
  }
  const originCity = originCityLookupResult.value;
  const originPosition = originCity.position;
  const destinationCity = destinationCityLookupResult.value;
  const destinationPosition = destinationCity.position;
  if (!originPosition) {
    return reply.status(404).send({
      message: "Could not find the coordinates of the origin city"
    });
  }
  if (!destinationPosition) {
    return reply.status(404).send({
      message: "Could not find the coordinates of the destination city"
    });
  }
  const distanceInKilometers = calculateDistanceByCoordinates(
    { latitude: originPosition.lat, longitude: originPosition.lng },
    { latitude: destinationPosition.lat, longitude: destinationPosition.lng }
  );
  return reply.header("cache-control", DEFAULT_PUBLIC_CACHE_CONTROL_HEADER).status(200).send({
    kilometers: distanceInKilometers
  });
}));
server.setErrorHandler(handleServerError);
var server_default = server;
var ROOT_DIRECTORY = environment.NODE_ENV === "production" ? path__default.default.join(__dirname, "..") : path__default.default.join(__dirname, "..", "..");

// src/server/swagger.ts
var OPENAPI_SPEC_DIRECTORY = path__default.default.join(ROOT_DIRECTORY, "docs", "spec");
function loadServerSwagger() {
  return __async(this, null, function* () {
    yield server_default.register(fastifyStatic__default.default, {
      root: OPENAPI_SPEC_DIRECTORY,
      prefix: "/spec"
    });
    yield server_default.register(fastifySwagger__default.default, {
      mode: "static",
      specification: {
        path: path__default.default.join(OPENAPI_SPEC_DIRECTORY, "openapi.yaml"),
        baseDir: OPENAPI_SPEC_DIRECTORY
      }
    });
    yield server_default.register(fastifySwaggerUI__default.default, {
      routePrefix: "/",
      uiConfig: {
        docExpansion: "full",
        deepLinking: false
      },
      staticCSP: true
    });
  });
}

// src/index.ts
var isServerless = environment.PORT === void 0;
function startServer() {
  return __async(this, null, function* () {
    yield loadServerSwagger();
    yield server_default.listen({
      host: "0.0.0.0",
      port: environment.PORT
    });
  });
}
if (!isServerless) {
  void startServer().catch((error) => {
    server_default.log.error(error);
    process.exit(1);
  });
}
function serverlessHandler(request, response) {
  return __async(this, null, function* () {
    yield loadServerSwagger();
    yield server_default.ready();
    server_default.server.emit("request", request, response);
  });
}
var src_default = serverlessHandler;

module.exports = src_default;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map