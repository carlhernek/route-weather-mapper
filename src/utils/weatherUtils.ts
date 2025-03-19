
import { RoutePoint } from './routeUtils';

export interface WeatherPoint {
  coordinates: [number, number];
  time: Date;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  wind?: number;
  location?: string;
}

export interface WeatherCheckpoint {
  location: string;
  arrivalTime: Date;
  weather: WeatherPoint;
}

// Map weather condition codes to simpler categories
const weatherIcons: Record<string, string> = {
  '01d': 'sun', // clear sky day
  '01n': 'moon', // clear sky night
  '02d': 'cloud-sun', // few clouds day
  '02n': 'cloud-moon', // few clouds night
  '03d': 'cloud', // scattered clouds
  '03n': 'cloud', // scattered clouds
  '04d': 'cloud', // broken clouds
  '04n': 'cloud', // broken clouds
  '09d': 'cloud-drizzle', // shower rain
  '09n': 'cloud-drizzle', // shower rain
  '10d': 'cloud-rain', // rain day
  '10n': 'cloud-rain', // rain night
  '11d': 'cloud-lightning', // thunderstorm
  '11n': 'cloud-lightning', // thunderstorm
  '13d': 'cloud-snow', // snow
  '13n': 'cloud-snow', // snow
  '50d': 'cloud-fog', // mist
  '50n': 'cloud-fog', // mist
};

/**
 * Fetch weather data for a specific location and time
 */
export const getWeatherData = async (
  lat: number,
  lon: number,
  time?: Date
): Promise<WeatherPoint | null> => {
  try {
    // For demo purposes, we'll generate mock weather data
    // In a real app, you would call a weather API like OpenWeatherMap or WeatherAPI
    const mockWeather = generateMockWeather(lat, lon, time);
    return mockWeather;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Generate mock weather data for demonstration
 */
const generateMockWeather = (lat: number, lon: number, time?: Date): WeatherPoint => {
  // Generate random but somewhat realistic weather based on coordinates
  const now = time || new Date();
  
  // Temperature varies with latitude (colder toward poles)
  const baseTemp = 25 - Math.abs(lat) / 2;
  // Add some random variation (-5 to +5)
  const randomVariation = Math.random() * 10 - 5;
  const temperature = Math.round(baseTemp + randomVariation);
  
  // Weather conditions - simple random selection
  const conditions = [
    { condition: 'Clear', icon: '01d' },
    { condition: 'Partly Cloudy', icon: '02d' },
    { condition: 'Cloudy', icon: '03d' },
    { condition: 'Overcast', icon: '04d' },
    { condition: 'Light Rain', icon: '10d' },
    { condition: 'Rain', icon: '09d' },
    { condition: 'Thunderstorm', icon: '11d' },
    { condition: 'Snow', icon: '13d' },
    { condition: 'Fog', icon: '50d' }
  ];
  
  // Weight toward fair weather (first few options more likely)
  const conditionIndex = Math.floor(Math.pow(Math.random(), 1.5) * conditions.length);
  const selectedCondition = conditions[conditionIndex];
  
  // Humidity and wind
  const humidity = Math.round(40 + Math.random() * 40); // 40-80%
  const wind = Math.round(Math.random() * 30); // 0-30 km/h
  
  return {
    coordinates: [lon, lat],
    time: now,
    temperature,
    condition: selectedCondition.condition,
    icon: weatherIcons[selectedCondition.icon] || 'cloud',
    humidity,
    wind
  };
};

/**
 * Calculate weather checkpoints along a route at 15 minute intervals
 */
export const calculateWeatherAlongRoute = async (
  routeFeature: GeoJSON.Feature<GeoJSON.Geometry>,
  startTime: Date,
  duration: number, // in seconds
  waypoints: RoutePoint[]
): Promise<WeatherCheckpoint[]> => {
  const checkpoints: WeatherCheckpoint[] = [];
  
  // Check if the feature has a LineString geometry
  if (!routeFeature.geometry || routeFeature.geometry.type !== 'LineString') {
    console.error('Route feature must have LineString geometry');
    return checkpoints;
  }
  
  const coordinates = routeFeature.geometry.coordinates;
  
  if (!coordinates || coordinates.length === 0) {
    return checkpoints;
  }
  
  // Add start point
  const startCoords = coordinates[0] as [number, number];
  const startWeather = await getWeatherData(startCoords[1], startCoords[0], startTime);
  
  if (startWeather) {
    checkpoints.push({
      location: waypoints[0]?.name || 'Start',
      arrivalTime: startTime,
      weather: startWeather
    });
  }
  
  // Calculate checkpoints every 15 minutes
  const intervalMs = 15 * 60 * 1000; // 15 minutes in milliseconds
  const totalIntervals = Math.floor(duration * 1000 / intervalMs);
  
  // For each interval, find the position along the route at that time
  for (let i = 1; i <= totalIntervals; i++) {
    const timeOffset = i * intervalMs;
    const checkpointTime = new Date(startTime.getTime() + timeOffset);
    
    // Calculate progress along the route (0 to 1)
    const progress = Math.min(timeOffset / (duration * 1000), 1);
    
    // Find the closest coordinate index based on progress
    const coordIndex = Math.floor(progress * coordinates.length);
    
    if (coordIndex < coordinates.length) {
      const coord = coordinates[coordIndex] as [number, number];
      const weatherData = await getWeatherData(coord[1], coord[0], checkpointTime);
      
      if (weatherData) {
        // Find nearest named waypoint
        let nearestWaypoint = 'En route';
        let minDistance = Infinity;
        
        waypoints.forEach(wp => {
          const distance = Math.hypot(
            wp.coordinates[0] - coord[0],
            wp.coordinates[1] - coord[1]
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestWaypoint = wp.name;
          }
        });
        
        checkpoints.push({
          location: nearestWaypoint,
          arrivalTime: checkpointTime,
          weather: weatherData
        });
      }
    }
  }
  
  // Add end point
  const endCoords = coordinates[coordinates.length - 1] as [number, number];
  const endTime = new Date(startTime.getTime() + duration * 1000);
  const endWeather = await getWeatherData(endCoords[1], endCoords[0], endTime);
  
  if (endWeather) {
    checkpoints.push({
      location: waypoints[waypoints.length - 1]?.name || 'End',
      arrivalTime: endTime,
      weather: endWeather
    });
  }
  
  return checkpoints;
};

