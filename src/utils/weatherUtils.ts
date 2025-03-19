import { mapWeatherCodeToIcon } from './weatherIcons';

export interface WeatherPoint {
  coordinates: [number, number];
  time: Date;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  isRisky: boolean;
  riskReason?: string;
}

export interface WeatherData extends WeatherPoint {
  isRisky: boolean;
  riskReason?: string;
}

export interface WeatherCheckpoint {
  coordinates: [number, number];
  arrivalTime: Date;
  location: string;
  weather: WeatherData;
}

// Evaluate weather risk based on temperature, condition, wind, and humidity
export function evaluateWeatherRisk(temperature: number, condition: string, wind: number, humidity: number): { isRisky: boolean; riskReason?: string } {
  if (temperature < 0 && condition.toLowerCase().includes('snow')) {
    return { isRisky: true, riskReason: 'Snow' };
  }

  if (temperature < 0) {
    return { isRisky: true, riskReason: 'Ice risk' };
  }

  if (condition.toLowerCase().includes('fog') && humidity > 90) {
    return { isRisky: true, riskReason: 'Fog risk' };
  }

  if (wind > 30) {
    return { isRisky: true, riskReason: 'High winds' };
  }

  if (condition.toLowerCase().includes('rain') && humidity > 80) {
    return { isRisky: true, riskReason: 'Heavy rain' };
  }

  if (condition.toLowerCase().includes('thunderstorm')) {
    return { isRisky: true, riskReason: 'Thunderstorm' };
  }

  return { isRisky: false, riskReason: undefined };
}

// Fetch weather data from OpenWeather API
export async function fetchWeatherData(
  coordinates: [number, number],
  time: Date
): Promise<WeatherPoint> {
  const token = localStorage.getItem('weatherToken');
  
  if (!token || token.trim() === '') {
    console.log('No OpenWeather API key found, using mock data');
    return createMockWeatherPoint(coordinates, time);
  }
  
  try {
    const apiKey = token.trim();
    const [lng, lat] = coordinates;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Failed to fetch weather data, using mock data instead');
      return createMockWeatherPoint(coordinates, time);
    }
    
    const data = await response.json();
    
    // Ensure coordinates are in tuple format [number, number]
    return {
      coordinates: [coordinates[0], coordinates[1]],
      time,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      icon: mapWeatherCodeToIcon(data.weather[0].id),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed),
      isRisky: false, // Will be evaluated later
      riskReason: undefined
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return createMockWeatherPoint(coordinates, time);
  }
}

function createMockWeatherPoint(coordinates: [number, number], time: Date): WeatherPoint {
  // Create a randomized but deterministic weather point for testing
  const hourOfDay = time.getHours();
  const isNight = hourOfDay < 6 || hourOfDay > 20;
  const randomSeed = coordinates[0] + coordinates[1] + time.getTime() / 86400000;
  
  // Generate random but consistent weather for the same time and place
  const seed = Math.sin(randomSeed) * 10000;
  const randomVal = Math.abs(seed - Math.floor(seed));
  
  // Make temperature depend on time of day
  let baseTemp = isNight ? 5 + randomVal * 10 : 15 + randomVal * 15;
  
  // Add seasonal variation (assuming Northern Hemisphere)
  const month = time.getMonth(); // 0-11
  const isSummer = month > 4 && month < 10;
  baseTemp += isSummer ? 10 : -5;
  
  const temperature = Math.round(baseTemp);
  
  // Weather conditions based on "randomness"
  let condition: string = 'Clear';
  let icon: string = 'sun';
  
  if (randomVal < 0.2) {
    condition = 'Clear';
    icon = isNight ? 'moon' : 'sun';
  } else if (randomVal < 0.5) {
    condition = 'Partly cloudy';
    icon = isNight ? 'cloud-moon' : 'cloud-sun';
  } else if (randomVal < 0.7) {
    condition = 'Cloudy';
    icon = 'cloud';
  } else if (randomVal < 0.85) {
    condition = 'Light rain';
    icon = 'cloud-drizzle';
  } else if (randomVal < 0.95) {
    condition = 'Rain';
    icon = 'cloud-rain';
  } else {
    condition = 'Thunderstorm';
    icon = 'cloud-lightning';
  }
  
  // Simulate fog in the morning
  const isMorning = hourOfDay >= 5 && hourOfDay <= 8;
  if (isMorning && randomVal > 0.7) {
    condition = 'Foggy';
    icon = 'cloud-fog';
  }
  
  // Simulate snow in cold temperatures
  if (temperature < 0 && randomVal > 0.6) {
    condition = 'Snow';
    icon = 'cloud-snow';
  }
  
  // Generate humidity and wind
  const humidity = Math.round(40 + randomVal * 50);
  const wind = Math.round(randomVal * 25);
  
  // Evaluate weather risk
  const { isRisky, riskReason } = evaluateWeatherRisk(temperature, condition, wind, humidity);
  
  // Ensure coordinates are in tuple format [number, number]
  return {
    coordinates: [coordinates[0], coordinates[1]],
    time: time,
    temperature,
    condition,
    icon,
    humidity,
    wind,
    isRisky,
    riskReason
  };
}

// Helper function to calculate checkpoint indices
function calculateCheckpointIndices(totalCoordinates: number, checkpointCount: number): number[] {
  const indices: number[] = [];
  for (let i = 1; i < checkpointCount; i++) {
    const index = Math.round((i * (totalCoordinates - 1)) / checkpointCount);
    indices.push(index);
  }
  return indices;
}

// Helper function to find the nearest waypoint name
function getNearestWaypointName(
  coord: [number, number],
  waypointCoordinates: any[],
  waypoints: any[]
): string | undefined {
  let minDistance = Infinity;
  let nearestWaypointIndex = -1;

  for (let i = 0; i < waypointCoordinates.length; i++) {
    const wpCoord = waypointCoordinates[i];
    const distance = Math.sqrt(
      Math.pow(coord[0] - wpCoord[0], 2) + Math.pow(coord[1] - wpCoord[1], 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestWaypointIndex = i;
    }
  }

  if (nearestWaypointIndex !== -1) {
    return waypoints[nearestWaypointIndex].name;
  }

  return undefined;
}

export async function calculateWeatherAlongRoute(
  routeFeature: any,
  departureTime: Date,
  totalDuration: number,
  waypoints: any[]
): Promise<WeatherCheckpoint[]> {
  const coordinates = routeFeature.geometry.coordinates;
  const totalCoordinates = coordinates.length;
  
  // We'll take weather snapshots at regular intervals
  const checkpointCount = Math.min(20, totalCoordinates);
  const checkpointIndices = calculateCheckpointIndices(totalCoordinates, checkpointCount);
  
  const checkpoints: WeatherCheckpoint[] = [];
  
  // Add starting point
  const startCoord = coordinates[0] as [number, number]; // Type assertion to ensure it's a tuple
  const startLocation = waypoints[0]?.name || 'Start';
  
  // Calculate the nearest locations for each checkpoint
  const waypointCoordinates = waypoints.map(wp => wp.coordinates);
  
  // Create checkpoints at intervals along the route with their estimated arrival times
  for (let i = 0; i < checkpointIndices.length; i++) {
    const index = checkpointIndices[i];
    const coord = coordinates[index];
    
    // Ensure coord is a tuple of [number, number]
    const coordTuple: [number, number] = [coord[0], coord[1]];
    
    // Calculate time of arrival at this checkpoint
    const progress = index / (totalCoordinates - 1);
    const timeOffset = progress * totalDuration;
    const arrivalTime = new Date(departureTime.getTime() + timeOffset * 1000);
    
    // Find nearest waypoint name or generate a generic location name
    const location = getNearestWaypointName(coordTuple, waypointCoordinates, waypoints) || 
                    `Checkpoint ${i + 1}`;
    
    try {
      // Get weather at this point and time
      const weatherPoint = await fetchWeatherData(coordTuple, arrivalTime);
      
      checkpoints.push({
        coordinates: coordTuple,
        arrivalTime,
        location,
        weather: evaluateWeatherRiskWithPoint(weatherPoint)
      });
    } catch (error) {
      console.error('Error fetching weather for checkpoint:', error);
    }
  }
  
  // Add ending point if it's not already included
  const endIndex = totalCoordinates - 1;
  if (!checkpointIndices.includes(endIndex)) {
    const endCoord = coordinates[endIndex];
    const endCoordTuple: [number, number] = [endCoord[0], endCoord[1]];
    const endLocation = waypoints[waypoints.length - 1]?.name || 'Destination';
    const arrivalTime = new Date(departureTime.getTime() + totalDuration * 1000);
    
    try {
      const weatherPoint = await fetchWeatherData(endCoordTuple, arrivalTime);
      
      checkpoints.push({
        coordinates: endCoordTuple,
        arrivalTime,
        location: endLocation,
        weather: evaluateWeatherRiskWithPoint(weatherPoint)
      });
    } catch (error) {
      console.error('Error fetching weather for endpoint:', error);
    }
  }
  
  return checkpoints;
}

// Helper to create a WeatherPoint with risk evaluation
function evaluateWeatherRiskWithPoint(point: WeatherPoint): WeatherData {
  const { isRisky, riskReason } = evaluateWeatherRisk(
    point.temperature, 
    point.condition, 
    point.wind, 
    point.humidity
  );
  
  return {
    ...point,
    isRisky,
    riskReason
  };
}
