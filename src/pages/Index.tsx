
import React, { useState, useEffect } from 'react';
import RouteMap from '@/components/RouteMap';
import LocationForm from '@/components/LocationForm';
import TokenInput from '@/components/TokenInput';
import RouteSummary from '@/components/RouteSummary';
import { Card } from '@/components/ui/card';
import CollapsibleSection from '@/components/CollapsibleSection';
import { RouteResult } from '@/utils/routeUtils';
import { WeatherCheckpoint, calculateWeatherAlongRoute } from '@/utils/weatherUtils';
import { useToast } from '@/hooks/use-toast';
import { Clock, Map, Info, AlertTriangle, Settings } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherCheckpoint[] | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [weatherApiKeyMissing, setWeatherApiKeyMissing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if OpenWeather API key is available
    const weatherToken = localStorage.getItem('weatherToken');
    setWeatherApiKeyMissing(!weatherToken || weatherToken.trim() === '');
    
    if (!weatherToken || weatherToken.trim() === '') {
      toast({
        title: "OpenWeather API Key Missing",
        description: "Add an OpenWeather API key in settings for real weather data",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleRouteCalculated = async (data: RouteResult | null, departureTime: string) => {
    setRouteData(data);
    
    if (data && data.route.features && data.route.features.length > 0) {
      setIsLoading(true);
      
      try {
        // Parse the departure time
        const startTimeObj = departureTime ? new Date(departureTime) : new Date();
        setStartTime(startTimeObj);
        
        // Get the route feature - ensuring it has the correct type
        const routeFeature = data.route.features[0];
        
        // Calculate weather along the route
        const weatherCheckpoints = await calculateWeatherAlongRoute(
          routeFeature,
          startTimeObj,
          data.duration,
          data.waypoints
        );
        
        setWeatherData(weatherCheckpoints);
        
        toast({
          title: "Weather data loaded",
          description: `${weatherCheckpoints.length} weather points along your route`,
        });
      } catch (error) {
        console.error('Error calculating weather:', error);
        toast({
          title: "Weather calculation error",
          description: "Could not calculate weather data for the route",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setWeatherData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-full px-3 py-4 mx-auto">
        <div className="space-y-3">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Route Weather</h1>
              <p className="text-sm text-muted-foreground">Plan with forecasts</p>
            </div>
            
            {isMobile ? (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">API Settings</h3>
                  <TokenInput />
                  <DrawerClose className="absolute right-4 top-4">
                    <Button variant="ghost" size="sm">Done</Button>
                  </DrawerClose>
                </DrawerContent>
              </Drawer>
            ) : (
              <TokenInput />
            )}
          </header>
          
          {weatherApiKeyMissing && (
            <Card className="p-2 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-800" />
                <p className="text-amber-800 text-xs">
                  OpenWeather API key not found. Using mock data.
                </p>
              </div>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-1 space-y-3">
              <CollapsibleSection 
                title="Route Planner" 
                defaultOpen={!routeData} 
                icon={<Map className="h-4 w-4 text-blue-500" />}
              >
                <LocationForm 
                  onRouteCalculated={handleRouteCalculated}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </CollapsibleSection>
              
              {routeData && (
                <CollapsibleSection 
                  title="Route Details" 
                  defaultOpen={false}
                  icon={<Info className="h-4 w-4 text-purple-500" />}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Distance</p>
                      <p className="text-base font-medium">{(routeData.distance / 1000).toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Duration</p>
                      <p className="text-base font-medium">{Math.round(routeData.duration / 60)} min</p>
                    </div>
                  </div>
                  {startTime && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">Departure</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <p className="text-xs">
                          {new Intl.DateTimeFormat('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric'
                          }).format(startTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </CollapsibleSection>
              )}
            </div>

            <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg lg:col-span-2 border">
              <RouteMap routeData={routeData} weatherData={weatherData} />
            </div>
          </div>

          {weatherData && weatherData.length > 0 && (
            <CollapsibleSection 
              title="Weather Along Route" 
              icon={<Clock className="h-4 w-4 text-green-500" />}
              defaultOpen={false}
            >
              <RouteSummary weatherCheckpoints={weatherData} startTime={startTime} />
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
