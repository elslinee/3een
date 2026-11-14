import axios from "axios";

export interface PlaceSearchResult {
  latitude: number;
  longitude: number;
  address: string;
}

// Photon (https://photon.komoot.io) is a free, open-source geocoder built on
// OpenStreetMap data (https://github.com/komoot/photon). No API key needed,
// and it covers places worldwide - unlike expo-location's native geocoder,
// which depends on the device/emulator having a working platform geocoder.
const PHOTON_API_URL = "https://photon.komoot.io/api/";

export const searchPlaces = async (
  query: string,
  limit: number = 6,
): Promise<PlaceSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const response = await axios.get(PHOTON_API_URL, {
    // No `lang` param: Photon only supports default/en/de/fr (anything else is a 400).
    // "default" returns each place's local name, i.e. Arabic for Arab countries.
    params: {
      q: trimmed,
      limit,
    },
  });

  const features: any[] = response.data?.features ?? [];

  return features
    .filter((feature) => Array.isArray(feature?.geometry?.coordinates))
    .map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties ?? {};

      const parts = [props.name, props.city, props.state, props.country].filter(
        (part, index, arr): part is string =>
          Boolean(part) && arr.indexOf(part) === index,
      );

      return {
        latitude,
        longitude,
        address: parts.join("، ") || trimmed,
      };
    });
};
