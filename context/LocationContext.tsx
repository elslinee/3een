import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import * as Location from "expo-location";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslationService } from "@/utils/translationService";

interface LocationContextType {
  location: Location.LocationObject | null;
  address: string;
  errorMsg: string | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
  openLocationSettingsAndRefresh: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<string>("جاري التحميل...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const SAVED_LOCATION_KEY = "savedLocation";
  const SAVED_ADDRESS_KEY = "savedAddress";
  const LAST_LOCATION_REQUEST_KEY = "lastLocationRequest";
  const FIRST_LAUNCH_DONE_KEY = "firstLaunchLocationDone";
  const PERMISSION_DENIED_KEY = "locationPermissionDenied";

  // Load saved location data from AsyncStorage
  const loadSavedLocationData = async () => {
    try {
      const savedLocationStr = await AsyncStorage.getItem(SAVED_LOCATION_KEY);
      const savedAddress = await AsyncStorage.getItem(SAVED_ADDRESS_KEY);

      if (savedLocationStr && savedAddress) {
        const savedLocation = JSON.parse(savedLocationStr);
        setLocation(savedLocation);
        setAddress(savedAddress);
        return true; // Data was loaded
      }
      return false; // No saved data
    } catch (error) {
      console.error("خطأ في تحميل البيانات المحفوظة:", error);
      return false;
    }
  };

  // Save location data to AsyncStorage
  const saveLocationData = async (
    locationData: Location.LocationObject,
    addressData: string
  ) => {
    try {
      await AsyncStorage.setItem(
        SAVED_LOCATION_KEY,
        JSON.stringify(locationData)
      );
      await AsyncStorage.setItem(SAVED_ADDRESS_KEY, addressData);
      await AsyncStorage.setItem(
        LAST_LOCATION_REQUEST_KEY,
        Date.now().toString()
      );
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
    }
  };

  // Check if we should request location (avoid too frequent requests)
  const shouldRequestLocation = async (): Promise<boolean> => {
    try {
      const lastRequest = await AsyncStorage.getItem(LAST_LOCATION_REQUEST_KEY);
      if (!lastRequest) return true;

      const lastRequestTime = parseInt(lastRequest);
      const now = Date.now();
      const timeDiff = now - lastRequestTime;

      // Only request location if more than 30 minutes have passed
      return timeDiff > 30 * 60 * 1000;
    } catch (error) {
      console.error("خطأ في التحقق من آخر طلب موقع:", error);
      return true;
    }
  };

  const getCurrentLocation = async (forceRequest: boolean = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // إذا لم يكن forceRequest، تحقق من وجود بيانات محفوظة أولاً
      if (!forceRequest) {
        const savedLocationStr = await AsyncStorage.getItem(SAVED_LOCATION_KEY);
        const savedAddress = await AsyncStorage.getItem(SAVED_ADDRESS_KEY);

        if (savedLocationStr && savedAddress) {
          // البيانات محفوظة، تحقق من آخر طلب موقع
          const shouldRequest = await shouldRequestLocation();
          if (!shouldRequest) {
            setIsLoading(false);
            return;
          }
        }
      }

      // Ensure device location services are enabled (separate from permission)
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        // التحقق من وجود بيانات محفوظة أولاً
        const savedLocationStr = await AsyncStorage.getItem(SAVED_LOCATION_KEY);
        const savedAddress = await AsyncStorage.getItem(SAVED_ADDRESS_KEY);

        if (savedLocationStr && savedAddress) {
          // البيانات المحفوظة موجودة، استخدمها ولا تظهر رسالة الخطأ
          setIsLoading(false);
          return;
        }

        // فقط إذا لم تكن هناك بيانات محفوظة، اعرض رسالة الخطأ
        // ولكن فقط إذا لم يتم السؤال من قبل أو كان forceRequest
        if (forceRequest) {
          setErrorMsg("الرجاء تفعيل خدمات الموقع في إعدادات الهاتف");
          setAddress("خدمات الموقع معطلة");
          setIsLoading(false);
          return;
        } else {
          // إذا لم يكن forceRequest، لا تعرض رسالة خطأ مزعجة
          // فقط اعرض عنوان افتراضي
          setAddress("الموقع غير متاح");
          setIsLoading(false);
          return;
        }
      }

      // Check existing permission without prompting first
      let { status: existingStatus, canAskAgain } =
        await Location.getForegroundPermissionsAsync();

      // If not granted, check if permission was denied permanently
      if (existingStatus !== "granted") {
        const permissionDenied = await AsyncStorage.getItem(
          PERMISSION_DENIED_KEY
        );

        // If permission was denied and can't ask again, don't request
        if (permissionDenied === "true" && canAskAgain === false) {
          setAddress("الموقع غير متاح");
          setErrorMsg("اضغط لتفعيل الموقع");
          setIsLoading(false);
          return;
        }

        // Only request if forced (user manually requested from settings)
        if (forceRequest) {
          const { status, canAskAgain: newCanAskAgain } =
            await Location.requestForegroundPermissionsAsync();

          // Save denial status if permission was denied and can't ask again
          if (status !== "granted" && newCanAskAgain === false) {
            await AsyncStorage.setItem(PERMISSION_DENIED_KEY, "true");
          } else if (status === "granted") {
            // Clear denial status if permission was granted
            await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
          }

          existingStatus = status;
        } else {
          // لا نطلب الصلاحية تلقائياً، فقط نعرض عنوان افتراضي
          setAddress("الموقع غير متاح");
          setErrorMsg("اضغط لتفعيل الموقع");
          setIsLoading(false);
          return;
        }
      }

      if (existingStatus !== "granted") {
        // Save denial status if can't ask again
        if (canAskAgain === false) {
          await AsyncStorage.setItem(PERMISSION_DENIED_KEY, "true");
        }
        // لا نطلب الصلاحية تلقائياً، فقط نعرض عنوان افتراضي
        setAddress("الموقع غير متاح");
        setErrorMsg("اضغط لتفعيل الموقع");
        setIsLoading(false);
        return;
      }

      // Try to get current position with low accuracy to avoid high precision requests
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });
      setLocation(location);

      let reverseGeocode: Location.LocationGeocodedAddress[] = [];
      try {
        reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (e) {
        // Non-fatal: continue with generic address
      }

      let finalAddress = "الموقع غير محدد";
      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];

        const translatedAddress = TranslationService.translateAddressComponents(
          {
            region: addr.region || undefined,
            country: addr.country || undefined,
          }
        );

        finalAddress = translatedAddress || "الموقع غير محدد";
      }

      setAddress(finalAddress);

      // حفظ البيانات للاستخدام دون إنترنت
      await saveLocationData(location, finalAddress);
    } catch (error) {
      console.error("خطأ في تحديد الموقع:", error);

      // التحقق من وجود بيانات محفوظة قبل إظهار الخطأ
      const savedLocationStr = await AsyncStorage.getItem(SAVED_LOCATION_KEY);
      const savedAddress = await AsyncStorage.getItem(SAVED_ADDRESS_KEY);

      if (!savedLocationStr || !savedAddress) {
        // فقط إذا لم تكن هناك بيانات محفوظة، اعرض رسالة الخطأ
        setErrorMsg("خطأ في تحديد الموقع");
        setAddress("خطأ في تحديد الموقع");
      }
      // إذا كانت هناك بيانات محفوظة، لا تعرض رسالة الخطأ
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  const openLocationSettingsAndRefresh = async () => {
    try {
      // Open platform location settings (Android). On iOS, this opens app settings.
      await Location.enableNetworkProviderAsync().catch(() => {});
    } catch {}
    try {
      // Open app settings page as a fallback (works on iOS and Android)
      await Linking.openSettings();
    } catch {}
    // Small delay to allow user to toggle then return
    // Check permission status when user comes back from settings
    // Only request if user manually enabled it in settings
    setTimeout(async () => {
      const { status, canAskAgain } =
        await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        // Permission was granted, clear denial status and get location
        await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
        await getCurrentLocation(true);
      } else if (canAskAgain) {
        // Can ask again, so user might have changed settings
        await getCurrentLocation(true);
      } else {
        // Permission denied permanently, don't request again
        await AsyncStorage.setItem(PERMISSION_DENIED_KEY, "true");
        setAddress("الموقع غير متاح");
        setErrorMsg("اضغط لتفعيل الموقع");
      }
    }, 1000);
  };

  useEffect(() => {
    const initLocation = async () => {
      // محاولة تحميل البيانات المحفوظة أولاً
      const hasData = await loadSavedLocationData();

      if (hasData) {
        // إذا كانت هناك بيانات محفوظة، عرضها مباشرة
        setIsLoading(false);
        // لا نحاول تحديث البيانات في الخلفية إذا كانت البيانات محفوظة
        // لتجنب طلب الصلاحية مرة أخرى
        return;
      } else {
        // طلب الموقع مرة واحدة فقط عند أول فتح للتطبيق
        try {
          const firstLaunchDone = await AsyncStorage.getItem(
            FIRST_LAUNCH_DONE_KEY
          );
          const permissionDenied = await AsyncStorage.getItem(
            PERMISSION_DENIED_KEY
          );

          // Only ask if first launch and permission wasn't permanently denied
          if (!firstLaunchDone && permissionDenied !== "true") {
            const { status, canAskAgain } =
              await Location.requestForegroundPermissionsAsync();

            // Save denial status if permission was denied and can't ask again
            if (status !== "granted" && canAskAgain === false) {
              await AsyncStorage.setItem(PERMISSION_DENIED_KEY, "true");
            }

            if (status === "granted") {
              await getCurrentLocation(true);
              await AsyncStorage.setItem(FIRST_LAUNCH_DONE_KEY, "true");
              // Clear denial status if permission was granted
              await AsyncStorage.removeItem(PERMISSION_DENIED_KEY);
              return;
            }
            // لم يتم منح الصلاحية في أول تشغيل
            await AsyncStorage.setItem(FIRST_LAUNCH_DONE_KEY, "true");
          }
        } catch {}

        // إذا لم تكن هناك بيانات محفوظة، ولم نتمكن من الحصول على الصلاحية، اعرض قيمة افتراضية
        setAddress("الموقع غير متاح");
        setErrorMsg("اضغط لتفعيل الموقع");
        setIsLoading(false);
      }
    };

    initLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        address,
        errorMsg,
        isLoading,
        refreshLocation,
        openLocationSettingsAndRefresh,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
