import { useState, useEffect } from "react";
import * as Location from "expo-location";

export const useCompass = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let headingSubscription: Location.LocationHeadingObject | any;

    (async () => {
      try {
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        // Check if location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          // Try to get last known position even if services are currently disabled
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown) {
            setLocation(lastKnown);
          } else {
            setErrorMsg("Location services are disabled");
            return;
          }
        } else {
          // Services are enabled, try last known first for speed
          let loc = await Location.getLastKnownPositionAsync();
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
            });
          }
          setLocation(loc);
        }

        // Heading requires separate permission check on some versions/platforms but generally falls under location
        headingSubscription = await Location.watchHeadingAsync((data) => {
          setHeading(
            data.trueHeading !== -1 ? data.trueHeading : data.magHeading,
          );
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Error initializing compass");
      }
    })();

    return () => {
      if (headingSubscription) {
        headingSubscription.remove();
      }
    };
  }, []);

  return { heading, location, errorMsg };
};
