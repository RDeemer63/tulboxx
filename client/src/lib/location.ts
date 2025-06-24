// Location and GPS utilities for time tracking
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export interface GeofenceResult {
  isWithinGeofence: boolean;
  distance: number;
  jobSiteAddress?: string;
}

// Get current GPS location
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

// Calculate distance between two points in meters
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if location is within geofence
export const checkGeofence = (
  currentLat: number,
  currentLon: number,
  targetLat: number,
  targetLon: number,
  radius: number
): GeofenceResult => {
  const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
  
  return {
    isWithinGeofence: distance <= radius,
    distance: Math.round(distance),
  };
};

// Reverse geocode coordinates to address (simplified)
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    // Using a simple geocoding service - in production you'd use Google Maps API or similar
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch (error) {
    // Fallback to coordinates if geocoding fails
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
};

// Format location for display
export const formatLocation = (lat: number, lon: number, accuracy?: number): string => {
  const latStr = lat.toFixed(6);
  const lonStr = lon.toFixed(6);
  const accStr = accuracy ? ` (±${Math.round(accuracy)}m)` : '';
  return `${latStr}, ${lonStr}${accStr}`;
};