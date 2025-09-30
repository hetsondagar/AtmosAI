export interface LocationData {
  lat: number;
  lng: number;
  name?: string;
  source: 'geolocation' | 'fallback' | 'settings';
}

export interface LocationSettings {
  autoLocation: boolean;
  defaultLocation: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Get user's current location with fallback handling
 */
export async function getCurrentLocation(settings?: LocationSettings): Promise<LocationData> {
  // Check if auto-location is enabled (default to true)
  const autoLocation = settings?.autoLocation ?? true;
  
  if (!autoLocation && settings?.coordinates) {
    return {
      lat: settings.coordinates.lat,
      lng: settings.coordinates.lng,
      name: settings.defaultLocation,
      source: 'settings'
    };
  }

  // Try to get location from browser geolocation
  if (navigator?.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        );
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: 'geolocation'
      };
    } catch (error) {
      console.warn('Geolocation failed:', error);
    }
  }

  // Fallback to default location
  return {
    lat: 37.7749, // San Francisco
    lng: -122.4194,
    name: settings?.defaultLocation || 'San Francisco, CA',
    source: 'fallback'
  };
}

/**
 * Watch user's location for real-time updates
 */
export function watchLocation(
  onLocationUpdate: (location: LocationData) => void,
  onError?: (error: GeolocationPositionError) => void,
  settings?: LocationSettings
) {
  if (!navigator?.geolocation) {
    // Fallback to default location
    getCurrentLocation(settings).then(onLocationUpdate);
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: 'geolocation'
      });
    },
    (error) => {
      console.warn('Location watch error:', error);
      if (onError) {
        onError(error);
      }
      // Fallback to default location
      getCurrentLocation(settings).then(onLocationUpdate);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute cache
    }
  );

  return watchId;
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number | null) {
  if (watchId !== null && navigator?.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Get location name from coordinates (reverse geocoding)
 */
import { API_BASE_URL } from "@/lib/api"

export async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    // Use the backend's reverse geocoding endpoint
    const response = await fetch(`${API_BASE_URL}/api/weather/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (response.ok) {
      const data = await response.json();
      const name = data?.data?.locationName || data?.locationName;
      return name || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }
  
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}

/**
 * Check if location services are available
 */
export function isLocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!isLocationAvailable()) {
    return false;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state === 'granted';
  } catch (error) {
    // Fallback: try to get current position
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1000 });
      });
      return true;
    } catch {
      return false;
    }
  }
}
