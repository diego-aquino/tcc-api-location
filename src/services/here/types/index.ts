import { HereComponents, HereSchema } from './generated';

export type HereGeocodeSearchParams = HereSchema['/geocode']['GET']['request']['searchParams'];
export type HereGeocodeSuccessResponseBody = HereSchema['/geocode']['GET']['response']['200']['body'];
export type HereGeocodeResultItem = HereComponents['schemas']['GeocodeResultItem'];

export type HereLookupSearchParams = HereSchema['/lookup']['GET']['request']['searchParams'];
export type HereLookupSuccessResponseBody = HereSchema['/lookup']['GET']['response']['200']['body'];
export type HereLookupPoint = HereComponents['schemas']['LookupResponse'];
