import { toRadians } from './math';

interface Point {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_IN_KILOMETERS = 6371;

// This uses the Haversine formula. See https://en.wikipedia.org/wiki/Haversine_formula.
export function calculateDistanceByCoordinates(point: Point, otherPoint: Point): number {
  const pointLatitudeInRadians = toRadians(point.latitude);
  const pointLongitudeInRadians = toRadians(point.longitude);

  const otherPointLatitudeInRadians = toRadians(otherPoint.latitude);
  const otherPointLongitudeInRadians = toRadians(otherPoint.longitude);

  const latitudeDifferenceInRadians = otherPointLatitudeInRadians - pointLatitudeInRadians;
  const longitudeDifferenceInRadians = otherPointLongitudeInRadians - pointLongitudeInRadians;

  const squaredHalfChordLength =
    Math.sin(latitudeDifferenceInRadians / 2) ** 2 +
    Math.cos(pointLatitudeInRadians) *
      Math.cos(otherPointLatitudeInRadians) *
      Math.sin(longitudeDifferenceInRadians / 2) ** 2;

  const centralAngleInRadians =
    2 * Math.atan2(Math.sqrt(squaredHalfChordLength), Math.sqrt(1 - squaredHalfChordLength));

  const distanceInKilometers = EARTH_RADIUS_IN_KILOMETERS * centralAngleInRadians;
  return distanceInKilometers;
}
