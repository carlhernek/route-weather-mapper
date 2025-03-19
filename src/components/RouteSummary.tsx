
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WeatherCheckpoint } from '@/utils/weatherUtils';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, CloudFog, CloudSun, Moon, CloudMoon, CloudDrizzle, Wind, ThermometerSnowflake } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RouteSummaryProps {
  weatherCheckpoints: WeatherCheckpoint[] | null;
  startTime: Date | null;
}

const RouteSummary = ({ weatherCheckpoints, startTime }: RouteSummaryProps) => {
  const isMobile = useIsMobile();
  
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
  
  // Get risk icon based on risk reason
  const getRiskIcon = (riskReason?: string) => {
    if (!riskReason) return null;
    
    switch (riskReason.toLowerCase()) {
      case 'snow':
        return <CloudSnow className="h-4 w-4 text-blue-200" />;
      case 'ice risk':
      case 'ice':
        return <ThermometerSnowflake className="h-4 w-4 text-blue-300" />;
      case 'fog risk':
      case 'fog':
        return <CloudFog className="h-4 w-4 text-gray-400" />;
      case 'high winds':
        return <Wind className="h-4 w-4 text-indigo-400" />;
      case 'heavy rain':
      case 'thunderstorm':
        return <CloudLightning className="h-4 w-4 text-purple-500" />;
      default:
        return <Cloud className="h-4 w-4 text-red-400" />;
    }
  };

  // Render mobile view with accordion
  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <div>
            {startTime && (
              <span>
                Departure: {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }).format(startTime)}
              </span>
            )}
          </div>
          <div>
            {weatherCheckpoints.length > 0 && (
              <span>
                Arrival: {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }).format(weatherCheckpoints[weatherCheckpoints.length - 1].arrivalTime)}
              </span>
            )}
          </div>
        </div>
        
        <Accordion type="multiple" className="w-full">
          {weatherCheckpoints.map((checkpoint, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className={checkpoint.weather.isRisky ? "bg-red-50 border border-red-100 rounded-md mb-1" : "border mb-1 rounded-md"}
            >
              <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="font-medium">
                    {new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    }).format(checkpoint.arrivalTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(checkpoint.weather.icon)}
                    <span className={`font-semibold ${
                      checkpoint.weather.temperature > 25 ? 'text-red-500' : 
                      checkpoint.weather.temperature < 5 ? 'text-blue-500' : 'text-gray-700'
                    }`}>
                      {checkpoint.weather.temperature}°C
                    </span>
                    {checkpoint.weather.isRisky && (
                      <Badge variant="destructive" className="ml-2">!</Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Location:</span>
                    <p className="text-sm">{checkpoint.location}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Weather:</span>
                    <p className="text-sm">{checkpoint.weather.condition}</p>
                  </div>
                  {checkpoint.weather.isRisky && (
                    <Badge variant="destructive" className="flex items-center gap-1 mt-1">
                      {getRiskIcon(checkpoint.weather.riskReason)}
                      {checkpoint.weather.riskReason}
                    </Badge>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  // Desktop view with table
  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Weather</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weatherCheckpoints.map((checkpoint, index) => (
              <TableRow 
                key={index} 
                className={checkpoint.weather.isRisky ? "bg-red-50" : ""}
              >
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
                <TableCell>
                  {checkpoint.weather.isRisky && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      {getRiskIcon(checkpoint.weather.riskReason)}
                      {checkpoint.weather.riskReason}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground flex justify-between">
        <div>
          {startTime && (
            <span>
              Departure: {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              }).format(startTime)}
            </span>
          )}
        </div>
        <div>
          {weatherCheckpoints.length > 0 && (
            <span>
              Arrival: {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                month: 'short',
                day: 'numeric'
              }).format(weatherCheckpoints[weatherCheckpoints.length - 1].arrivalTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteSummary;
