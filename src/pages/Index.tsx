
import React from 'react';
import RouteMap from '@/components/RouteMap';
import LocationForm from '@/components/LocationForm';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Route Weather Mapper</h1>
            <p className="text-lg text-gray-600">Plan your journey with real-time weather forecasts</p>
          </div>
          
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
            <LocationForm />
          </Card>

          <div className="h-[600px] rounded-xl overflow-hidden shadow-lg">
            <RouteMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
