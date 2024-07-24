import axios, { AxiosInstance } from 'axios';

import { environment } from '@/config/environment';

import {
  HereGeocodeResultItem,
  HereGeocodeSearchParams,
  HereGeocodeSuccessResponseBody,
  HereLookupPoint,
  HereLookupSearchParams,
  HereLookupSuccessResponseBody,
} from './types';

class HereClient {
  private api: {
    geocode: AxiosInstance;
    lookup: AxiosInstance;
  };

  constructor() {
    this.api = {
      geocode: axios.create({
        baseURL: environment.HERE_GEOCODING_URL,
        params: { apiKey: environment.HERE_API_KEY },
        paramsSerializer: (params) => new URLSearchParams(params).toString(),
      }),

      lookup: axios.create({
        baseURL: environment.HERE_LOOKUP_URL,
        params: { apiKey: environment.HERE_API_KEY },
        paramsSerializer: (params) => new URLSearchParams(params).toString(),
      }),
    };
  }

  async searchCities(query: string): Promise<HereGeocodeResultItem[]> {
    const cities = await this.geocode({
      q: query,
      types: ['city'],
    });

    return cities;
  }

  private async geocode(params: HereGeocodeSearchParams): Promise<HereGeocodeResultItem[]> {
    const response = await this.api.geocode.get<HereGeocodeSuccessResponseBody>('/geocode', {
      params: {
        lang: ['pt'],
        limit: '10',
        ...params,
      } satisfies HereGeocodeSearchParams,
    });

    const items = response.data.items.map((item) => ({
      ...item,
      id: this.encodePointId(item.id),
    }));

    return items;
  }

  async lookupById(pointId: string): Promise<HereLookupPoint> {
    const decodedId = this.decodePointId(pointId);

    const response = await this.api.lookup.get<HereLookupSuccessResponseBody>('/lookup', {
      params: {
        id: decodedId,
        lang: ['pt'],
      } satisfies HereLookupSearchParams,
    });

    const point = response.data;
    return point;
  }

  private encodePointId(pointId: string) {
    return Buffer.from(pointId, 'utf-8').toString('base64');
  }

  private decodePointId(encodedPointId: string) {
    return Buffer.from(encodedPointId, 'base64').toString('utf-8');
  }
}

export default HereClient;
