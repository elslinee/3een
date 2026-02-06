/**
 * Calculate the Qibla bearing (direction to Kaaba) from a given latitude and longitude.
 * Kaaba Coordinates: Lat 21.4225, Lon 39.8262
 * Formula: atan2(sin(Δlon) * cos(lat2), cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(Δlon))
 *
 * @param lat Latitude of the user
 * @param lon Longitude of the user
 * @returns Degree (0-360) towards Qibla
 */
export const calculateQibla = (lat: number, lon: number): number => {
  const PI = Math.PI;
  const lat1 = (lat * PI) / 180;
  const lon1 = (lon * PI) / 180;

  // Kaaba coordinates
  const lat2 = (21.4225 * PI) / 180;
  const lon2 = (39.8262 * PI) / 180;

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / PI;
  bearing = (bearing + 360) % 360;

  return bearing;
};
