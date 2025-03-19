
/**
 * Maps OpenWeather condition codes to Lucide icon names
 * Based on OpenWeather API condition codes:
 * https://openweathermap.org/weather-conditions
 */

export function mapWeatherCodeToIcon(code: number): string {
  // Thunderstorm
  if (code >= 200 && code < 300) {
    return 'cloud-lightning';
  }
  
  // Drizzle
  if (code >= 300 && code < 400) {
    return 'cloud-drizzle';
  }
  
  // Rain
  if (code >= 500 && code < 600) {
    // Heavy rain
    if (code >= 502) {
      return 'cloud-rain';
    }
    return 'cloud-drizzle';
  }
  
  // Snow
  if (code >= 600 && code < 700) {
    return 'cloud-snow';
  }
  
  // Atmosphere (fog, mist, etc.)
  if (code >= 700 && code < 800) {
    return 'cloud-fog';
  }
  
  // Clear
  if (code === 800) {
    // We don't have time of day information here, so default to sun
    return 'sun';
  }
  
  // Clouds
  if (code > 800 && code < 900) {
    // Few clouds
    if (code === 801) {
      return 'cloud-sun';
    }
    // Scattered clouds or more
    return 'cloud';
  }
  
  // Default
  return 'cloud';
}
