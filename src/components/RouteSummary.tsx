
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { WeatherCheckpoint } from '@/utils/weatherUtils';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, CloudFog, CloudSun, Moon, CloudMoon, CloudDrizzle } from 'lucide-react';

interface RouteSummaryProps {
  weatherCheckpoints: WeatherCheckpoint[] | null;
  startTime: Date | null;
}

const RouteSummary = ({ weatherCheckpoints, startTime }: RouteSummaryProps) => {
  if (!weatherCheckpoints || weatherCheckpoints.length === 0) {
    return null;
  }

  // Weather icon mapping
  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'moon': return <Moon className="h-4 w-4 text-blue-300" />;
      case 'cloud': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'cloud-sun': return <CloudSun className="h-4 w-4 text-yellow-500" />;
      case 'cloud-moon': return <CloudMoon className="h-4 w-4 text-blue-300" />;
      case 'cloud-rain': return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'cloud-lightning': return <CloudLightning className="h-4 w-4 text-purple-500" />;
      case 'cloud-snow': return <CloudSnow className="h-4 w-4 text-blue-200" />;
      case 'cloud-fog': return <CloudFog className="h-4 w-4 text-gray-400" />;
      case 'cloud-drizzle': return <CloudDrizzle className="h-4 w-4 text-blue-400" />;
      default: return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Weather Along Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Weather</TableHead>
                <TableHead>Temp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weatherCheckpoints.map((checkpoint, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    }).format(checkpoint.arrivalTime)}
                  </TableCell>
                  <TableCell>{checkpoint.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(checkpoint.weather.icon)}
                      <span>{checkpoint.weather.condition}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      checkpoint.weather.temperature > 25 ? 'text-red-500' : 
                      checkpoint.weather.temperature < 5 ? 'text-blue-500' : 'text-gray-700'
                    }`}>
                      {checkpoint.weather.temperature}°C
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Showing route weather forecast at 15-minute intervals</p>
          <p className="mt-1">
            {startTime && (
              <>
                Departure: {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }).format(startTime)}
              </>
            )}
          </p>
          {weatherCheckpoints.length > 0 && (
            <p>
              Arrival: {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }).format(weatherCheckpoints[weatherCheckpoints.length - 1].arrivalTime)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteSummary;
