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
  isRisky?: boolean;
  riskReason?: string;
}

export interface WeatherCheckpoint {
  location: string;
  arrivalTime: Date;
  weather: WeatherPoint;
}

// Map OpenWeather condition codes to simpler categories and Lucide icons
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

// Cache for weather data to avoid excessive API calls
const weatherCache = new Map<string, WeatherPoint>();

/**
 * Fetch weather data for a specific location and time
 */
export const getWeatherData = async (
  lat: number,
  lon: number,
  time?: Date
): Promise<WeatherPoint> => {
  const now = time || new Date();
  const weatherToken = localStorage.getItem('weatherToken');
  
  // Create a cache key based on coordinates and time (rounded to hours)
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)},${now.getHours()},${now.getDate()}`;
  
  // Check if we have cached data for this location and time
  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey)!;
  }
  
  try {
    // Only make real API calls if we have a token
    if (weatherToken && weatherToken.trim() !== '') {
      // For real implementation - call OpenWeather API
      const weatherData = await fetchOpenWeatherData(lat, lon, weatherToken, now);
      
      // Evaluate if the weather is risky
      const riskAssessment = evaluateWeatherRisk(weatherData);
      weatherData.isRisky = riskAssessment.isRisky;
      weatherData.riskReason = riskAssessment.riskReason || undefined;
      
      // Cache the result
      weatherCache.set(cacheKey, weatherData);
      return weatherData;
    } else {
      // Fallback to mock data if no token
      const mockWeather = generateMockWeather(lat, lon, now);
      // Evaluate if the mock weather is risky
      const riskAssessment = evaluateWeatherRisk(mockWeather);
      mockWeather.isRisky = riskAssessment.isRisky;
      mockWeather.riskReason = riskAssessment.riskReason || undefined;
      
      weatherCache.set(cacheKey, mockWeather);
      return mockWeather;
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data on error
    const mockWeather = generateMockWeather(lat, lon, now);
    // Evaluate if the mock weather is risky
    const riskAssessment = evaluateWeatherRisk(mockWeather);
    mockWeather.isRisky = riskAssessment.isRisky;
    mockWeather.riskReason = riskAssessment.riskReason || undefined;
    
    weatherCache.set(cacheKey, mockWeather);
    return mockWeather;
  }
};

/**
 * Fetch real weather data from OpenWeather API
 */
const fetchOpenWeatherData = async (
  lat: number, 
  lon: number, 
  apiKey: string,
  time: Date
): Promise<WeatherPoint> => {
  // Determine if we need current weather or forecast
  const now = new Date();
  const hoursInFuture = (time.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // If time is within 2 hours from now, use current weather
  // Otherwise use the forecast API
  let url: string;
  
  if (hoursInFuture < 2) {
    // Current weather API
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  } else {
    // Forecast API
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (hoursInFuture < 2) {
    // Parse current weather response
    const weatherPoint = {
      coordinates: [lon, lat],
      time,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      icon: weatherIcons[data.weather[0].icon] || 'cloud',
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
    };
    
    return weatherPoint;
  } else {
    // Parse forecast response - find closest forecast time to our target time
    const forecasts = data.list;
    let closestForecast = forecasts[0];
    let minTimeDiff = Infinity;
    
    for (const forecast of forecasts) {
      const forecastTime = new Date(forecast.dt * 1000);
      const timeDiff = Math.abs(forecastTime.getTime() - time.getTime());
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestForecast = forecast;
      }
    }
    
    const weatherPoint = {
      coordinates: [lon, lat],
      time,
      temperature: Math.round(closestForecast.main.temp),
      condition: closestForecast.weather[0].description,
      icon: weatherIcons[closestForecast.weather[0].icon] || 'cloud',
      humidity: closestForecast.main.humidity,
      wind: Math.round(closestForecast.wind.speed * 3.6) // Convert m/s to km/h
    };
    
    return weatherPoint;
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
  
  // Add more risky conditions to the mock data for testing
  const riskyConditions = [
    { condition: 'Heavy Snow', icon: '13d' },
    { condition: 'Thunderstorm', icon: '11d' },
    { condition: 'Heavy Rain', icon: '09d' },
    { condition: 'Fog', icon: '50d' }
  ];
  
  // 20% chance of risky weather in mock data
  if (Math.random() < 0.2) {
    const riskyIndex = Math.floor(Math.random() * riskyConditions.length);
    const selectedCondition = riskyConditions[riskyIndex];
    
    return {
      coordinates: [lon, lat],
      time: now,
      temperature: temperature,
      condition: selectedCondition.condition,
      icon: weatherIcons[selectedCondition.icon] || 'cloud',
      humidity,
      wind
    };
  }
  
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
 * Calculate distance between two points in kilometers
 */
const haversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate weather checkpoints along a route at either 15 minute intervals 
 * or maximum 10km distance, whichever comes first
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
  
  checkpoints.push({
    location: waypoints[0]?.name || 'Start',
    arrivalTime: startTime,
    weather: startWeather
  });
  
  // Calculate time and distance-based checkpoints
  const timeIntervalMs = 15 * 60 * 1000; // 15 minutes in milliseconds
  const distanceIntervalKm = 10; // 10 kilometers
  
  // Calculate point density
  const totalDistance = calculateRouteDistance(coordinates);
  const totalTimeMs = duration * 1000;
  
  // Calculate speed (km/ms) for time estimation
  const speedKmMs = totalDistance / totalTimeMs;
  
  let lastCheckpointDist = 0;
  let lastCheckpointTime = startTime.getTime();
  let lastLat = startCoords[1];
  let lastLon = startCoords[0];
  
  // Process route coordinates (skip first as we already added it)
  for (let i = 1; i < coordinates.length; i++) {
    const [lon, lat] = coordinates[i] as [number, number];
    
    // Calculate distance from last point
    const segmentDistance = haversineDistance(lastLat, lastLon, lat, lon);
    const currentDistance = lastCheckpointDist + segmentDistance;
    
    // Estimate time at this point based on distance and speed
    const distanceCovered = currentDistance / totalDistance;
    const timeAtPoint = startTime.getTime() + (distanceCovered * totalTimeMs);
    
    // Check if we need a new checkpoint based on time or distance
    const timeSinceLastCheckpoint = timeAtPoint - lastCheckpointTime;
    const distanceSinceLastCheckpoint = currentDistance - lastCheckpointDist;
    
    if (timeSinceLastCheckpoint >= timeIntervalMs || distanceSinceLastCheckpoint >= distanceIntervalKm) {
      const checkpointTime = new Date(timeAtPoint);
      const weatherData = await getWeatherData(lat, lon, checkpointTime);
      
      // Find nearest named waypoint
      let nearestWaypoint = 'En route';
      let minDistance = Infinity;
      
      waypoints.forEach(wp => {
        const distance = Math.hypot(
          wp.coordinates[0] - lon,
          wp.coordinates[1] - lat
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
      
      // Update last checkpoint references
      lastCheckpointDist = currentDistance;
      lastCheckpointTime = timeAtPoint;
    }
    
    lastLat = lat;
    lastLon = lon;
  }
  
  // Add end point (if it's not too close to the last added checkpoint)
  const endCoords = coordinates[coordinates.length - 1] as [number, number];
  const endTime = new Date(startTime.getTime() + duration * 1000);
  
  // Only add endpoint if it's at least 5 minutes or 2km after the last checkpoint
  const timeSinceLastCheckpoint = endTime.getTime() - lastCheckpointTime;
  const distToEnd = haversineDistance(lastLat, lastLon, endCoords[1], endCoords[0]);
  
  if (timeSinceLastCheckpoint >= 5 * 60 * 1000 || distToEnd >= 2) {
    const endWeather = await getWeatherData(endCoords[1], endCoords[0], endTime);
    
    checkpoints.push({
      location: waypoints[waypoints.length - 1]?.name || 'End',
      arrivalTime: endTime,
      weather: endWeather
    });
  }
  
  return checkpoints;
};

/**
 * Calculate total distance of a route in kilometers
 */
const calculateRouteDistance = (coordinates: number[][]): number => {
  let distance = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1];
    const [lon2, lat2] = coordinates[i];
    
    distance += haversineDistance(lat1, lon1, lat2, lon2);
  }
  
  return distance;
};

/**
 * Evaluate if weather conditions are potentially risky for travel
 */
export const evaluateWeatherRisk = (weather: WeatherPoint): { isRisky: boolean; riskReason: string | null } => {
  // Define risk thresholds
  const LOW_TEMP_THRESHOLD = 0; // Celsius - risk of ice
  const HIGH_WIND_THRESHOLD = 40; // km/h
  const HIGH_HUMIDITY_THRESHOLD = 95; // Percentage - risk of fog

  // Check for risky conditions
  if (weather.temperature <= LOW_TEMP_THRESHOLD) {
    return { isRisky: true, riskReason: "Ice risk" };
  }
  
  if (weather.wind && weather.wind >= HIGH_WIND_THRESHOLD) {
    return { isRisky: true, riskReason: "High winds" };
  }
  
  if (weather.humidity && weather.humidity >= HIGH_HUMIDITY_THRESHOLD) {
    return { isRisky: true, riskReason: "Fog risk" };
  }
  
  // Check condition-based risks
  const riskyConditions = [
    { keywords: ['snow', 'blizzard'], reason: "Snow" },
    { keywords: ['thunderstorm', 'lightning'], reason: "Thunderstorm" },
    { keywords: ['heavy rain', 'downpour'], reason: "Heavy rain" },
    { keywords: ['fog', 'mist'], reason: "Fog" },
    { keywords: ['ice', 'freezing'], reason: "Ice" },
    { keywords: ['hail'], reason: "Hail" }
  ];
  
  for (const riskType of riskyConditions) {
    if (riskType.keywords.some(keyword => 
      weather.condition.toLowerCase().includes(keyword.toLowerCase()))) {
      return { isRisky: true, riskReason: riskType.reason };
    }
  }
  
  return { isRisky: false, riskReason: null };
};
