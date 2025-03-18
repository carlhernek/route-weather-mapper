
import React, { useState } from 'react';
import RouteMap from '@/components/RouteMap';
import LocationForm from '@/components/LocationForm';
import TokenInput from '@/components/TokenInput';
import { Card } from '@/components/ui/card';
import { RouteResult } from '@/utils/routeUtils';

const Index = () => {
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteCalculated = (data: RouteResult | null) => {
    setRouteData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Route Weather Mapper</h1>
              <p className="text-lg text-muted-foreground">Plan your journey with real-time weather forecasts</p>
            </div>
            <TokenInput />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg lg:col-span-1">
              <LocationForm 
                onRouteCalculated={handleRouteCalculated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </Card>

            <div className="h-[600px] rounded-xl overflow-hidden shadow-lg lg:col-span-2">
              <RouteMap routeData={routeData} />
            </div>
          </div>

          {routeData && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Distance</p>
                  <p className="text-lg font-medium">{(routeData.distance / 1000).toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-lg font-medium">{Math.round(routeData.duration / 60)} min</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
