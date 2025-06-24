// Google Maps integration for route optimization and geocoding

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelTime {
  origin: string;
  destination: string;
  duration: number; // seconds
  distance: number; // meters
  status: string;
}

export interface GeocodeResult {
  address: string;
  coordinates: Coordinates;
  formattedAddress: string;
  placeId?: string;
}

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
  }

  /**
   * Get travel times between multiple locations using Distance Matrix API
   */
  async getDistanceMatrix(
    origins: string[],
    destinations: string[]
  ): Promise<TravelTime[]> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured, using fallback estimates');
      return this.getFallbackTravelTimes(origins, destinations);
    }

    try {
      const originsParam = origins.join('|');
      const destinationsParam = destinations.join('|');
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&units=metric&key=${this.apiKey}`;
      
      console.log('Google Maps API call:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Google Maps API response:', JSON.stringify(data, null, 2));
      
      if (data.status !== 'OK') {
        console.error('Google Maps API error:', data.status, data.error_message);
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      const results: TravelTime[] = [];
      
      data.rows.forEach((row: any, originIndex: number) => {
        row.elements.forEach((element: any, destIndex: number) => {
          results.push({
            origin: origins[originIndex],
            destination: destinations[destIndex],
            duration: element.duration?.value || 1800, // Default 30 min
            distance: element.distance?.value || 10000, // Default 10km
            status: element.status
          });
        });
      });
      
      return results;
    } catch (error) {
      console.error('Distance Matrix API failed:', error);
      return this.getFallbackTravelTimes(origins, destinations);
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured, geocoding unavailable');
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results.length) {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      const result = data.results[0];
      
      return {
        address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses: string[]): Promise<(GeocodeResult | null)[]> {
    const results = await Promise.all(
      addresses.map(address => this.geocodeAddress(address))
    );
    return results;
  }

  /**
   * Fallback travel time estimation when API is unavailable
   */
  private getFallbackTravelTimes(origins: string[], destinations: string[]): TravelTime[] {
    const results: TravelTime[] = [];
    
    origins.forEach(origin => {
      destinations.forEach(destination => {
        // Estimate 30 minutes average travel time in urban areas
        const estimatedDuration = origin === destination ? 0 : 1800; // 30 minutes
        const estimatedDistance = origin === destination ? 0 : 15000; // 15km average
        
        results.push({
          origin,
          destination,
          duration: estimatedDuration,
          distance: estimatedDistance,
          status: 'FALLBACK_ESTIMATE'
        });
      });
    });
    
    return results;
  }

  /**
   * Calculate estimated travel time between two coordinates (straight-line distance approximation)
   */
  calculateEstimatedTravelTime(
    origin: Coordinates,
    destination: Coordinates,
    speedKmH: number = 40 // Average city driving speed
  ): number {
    const distance = this.calculateDistance(origin, destination);
    const timeHours = distance / speedKmH;
    return Math.round(timeHours * 3600); // Convert to seconds
  }

  /**
   * Calculate straight-line distance between two coordinates (Haversine formula)
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const googleMapsService = new GoogleMapsService();