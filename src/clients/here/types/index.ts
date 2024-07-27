import { HereSearchComponents, HereSearchSchema } from './search/generated';

export type HereGeocodeSearchParams = HereSearchSchema['/geocode']['GET']['request']['searchParams'];
export type HereGeocodeSuccessResponseBody = HereSearchSchema['/geocode']['GET']['response']['200']['body'];
export type HereGeocodeResultItem = HereSearchComponents['schemas']['GeocodeResultItem'];

export type HereLookupSearchParams = HereSearchSchema['/lookup']['GET']['request']['searchParams'];
export type HereLookupSuccessResponseBody = HereSearchSchema['/lookup']['GET']['response']['200']['body'];
export type HereLookupPlace = HereSearchComponents['schemas']['LookupResponse'];
