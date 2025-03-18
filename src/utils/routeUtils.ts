
import mapboxgl from 'mapbox-gl';

export interface RoutePoint {
  name: string;
  coordinates: [number, number];
}

export interface RouteResult {
  route: GeoJSON.FeatureCollection;
  distance: number;
  duration: number;
  waypoints: RoutePoint[];
}

/**
 * Fetches coordinates for a location using Mapbox Geocoding API
 */
export const getCoordinatesForLocation = async (
  location: string,
  accessToken: string
): Promise<[number, number] | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json?access_token=${accessToken}&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

/**
 * Calculates a route between multiple locations
 */
export const calculateRoute = async (
  startLocation: string,
  endLocation: string,
  waypoints: string[],
  accessToken: string
): Promise<RouteResult | null> => {
  try {
    // Get coordinates for all locations
    const startCoords = await getCoordinatesForLocation(startLocation, accessToken);
    const endCoords = await getCoordinatesForLocation(endLocation, accessToken);
    
    if (!startCoords || !endCoords) {
      console.error('Could not get coordinates for start or end location');
      return null;
    }
    
    // Process waypoints
    const waypointCoordinates: [number, number][] = [];
    for (const waypoint of waypoints) {
      const coords = await getCoordinatesForLocation(waypoint, accessToken);
      if (coords) {
        waypointCoordinates.push(coords);
      }
    }
    
    // Construct the coordinates string for the API request
    let coordinatesString = `${startCoords[0]},${startCoords[1]}`;
    
    waypointCoordinates.forEach(coords => {
      coordinatesString += `;${coords[0]},${coords[1]}`;
    });
    
    coordinatesString += `;${endCoords[0]},${endCoords[1]}`;
    
    // Make request to Mapbox Directions API
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?alternatives=false&geometries=geojson&steps=false&access_token=${accessToken}`
    );
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.error('No routes found');
      return null;
    }
    
    const route = data.routes[0];
    
    // Create GeoJSON feature collection from the route
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      ]
    };
    
    // Create waypoints array with names and coordinates
    const routeWaypoints: RoutePoint[] = [
      { name: startLocation, coordinates: startCoords }
    ];
    
    waypoints.forEach((wp, index) => {
      if (index < waypointCoordinates.length) {
        routeWaypoints.push({
          name: wp,
          coordinates: waypointCoordinates[index]
        });
      }
    });
    
    routeWaypoints.push({ name: endLocation, coordinates: endCoords });
    
    return {
      route: geojson,
      distance: route.distance,
      duration: route.duration,
      waypoints: routeWaypoints
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};
