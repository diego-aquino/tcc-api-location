// Auto-generated by zimic.
// NOTE: Do not manually edit this file. Changes will be overridden.

import type {
  HttpSchema,
  HttpSearchParamsSerialized,
  HttpStatusCode,
  MergeHttpResponsesByStatusCode,
} from 'zimic/http';

export type LocationSchema = HttpSchema<{
  '/cities': {
    /** Buscar cidades */
    GET: LocationOperations['cities/search'];
  };
  '/cities/distances': {
    /** Obter a distância entre duas cidades */
    GET: LocationOperations['cities/distances/get'];
  };
}>;

export interface LocationComponents {
  schemas: {
    City: {
      /**
       * @description O identificador da cidade
       * @example aGVyZTpjbTpuYW1lZHBsYWNlOjIzMDMwNjEy
       */
      id: string;
      /**
       * @description O nome da cidade
       * @example São Paulo
       */
      name?: string;
      /**
       * @description O nome do estado
       * @example São Paulo
       */
      stateName?: string;
      /**
       * @description O código do estado
       * @example SP
       */
      stateCode?: string;
      /**
       * @description O nome do país
       * @example Brasil
       */
      countryName?: string;
      /**
       * @description O código do país
       * @example BRA
       */
      countryCode?: string;
    };
    Distance: {
      /**
       * Format: double
       * @description A distância em quilômetros (km)
       * @example 145.3
       */
      kilometers: number;
    };
    ValidationError: {
      /**
       * @description A mensagem de erro
       * @example Validation error
       */
      message: string;
      /** @description Os problemas de validação */
      issues?: ({
        /**
         * @description A mensagem de erro
         * @example Invalid input: expected string, received number
         */
        message?: string;
        /**
         * @description O código do erro
         * @example invalid_type
         */
        code?: string;
        /**
         * @description O caminho do erro
         * @example [
         *       "names",
         *       1
         *     ]
         */
        path?: (string | number)[];
      } & {
        [key: string]: any;
      })[];
    };
    NotFoundError: {
      /**
       * @description A mensagem de erro
       * @example Not found
       */
      message: string;
    };
    InternalServerError: {
      /**
       * @description A mensagem de erro
       * @example Internal server error
       */
      message: string;
    };
  };
}

export interface LocationOperations {
  'cities/search': HttpSchema.Method<{
    request: {
      searchParams: HttpSearchParamsSerialized<{
        /**
         * @description O nome da cidade a ser buscada
         * @example São Paulo
         */
        query: string;
      }>;
    };
    response: MergeHttpResponsesByStatusCode<
      [
        {
          /** @description Cidades encontradas */
          200: {
            body: LocationComponents['schemas']['City'][];
          };
          /** @description Erro de validação */
          400: {
            body: LocationComponents['schemas']['ValidationError'];
          };
        },
        {
          /** @description Erro inesperado */
          [StatusCode in HttpStatusCode.ServerError]: {
            body: LocationComponents['schemas']['InternalServerError'];
          };
        },
      ]
    >;
  }>;
  'cities/distances/get': HttpSchema.Method<{
    request: {
      searchParams: HttpSearchParamsSerialized<{
        /**
         * @description O identificador da cidade de origem
         * @example aGVyZTpjbTpuYW1lZHBsYWNlOjIzMDMwNjEy
         */
        originCityId: string;
        /**
         * @description O identificador da cidade de destino
         * @example aGVyZTpjbTpuYW1lZHBsYWNlOjIzMDM2NjI4
         */
        destinationCityId: string;
      }>;
    };
    response: MergeHttpResponsesByStatusCode<
      [
        {
          /** @description Distância calculada */
          200: {
            body: LocationComponents['schemas']['Distance'];
          };
          /** @description Erro de validação */
          400: {
            body: LocationComponents['schemas']['ValidationError'];
          };
          /** @description Uma ou ambas as cidades não encontradas */
          404: {
            body: LocationComponents['schemas']['NotFoundError'];
          };
        },
        {
          /** @description Erro inesperado */
          [StatusCode in HttpStatusCode.ServerError]: {
            body: LocationComponents['schemas']['InternalServerError'];
          };
        },
      ]
    >;
  }>;
}
