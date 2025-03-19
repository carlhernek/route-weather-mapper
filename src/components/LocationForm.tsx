
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Plus, X } from 'lucide-react';
import LocationInput from './LocationInput';
import { calculateRoute, RouteResult } from '@/utils/routeUtils';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: number;
  address: string;
}

interface LocationFormProps {
  onRouteCalculated: (routeData: RouteResult | null, startTime: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LocationForm = ({ onRouteCalculated, isLoading, setIsLoading }: LocationFormProps) => {
  const [startTime, setStartTime] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [waypoints, setWaypoints] = useState<Location[]>([]);
  const { toast } = useToast();

  const addWaypoint = () => {
    setWaypoints([...waypoints, { id: Date.now(), address: '' }]);
  };

  const removeWaypoint = (id: number) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const setTimeToNow = () => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    setStartTime(formattedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get token from localStorage
    const mapboxToken = localStorage.getItem('mapboxToken');
    if (!mapboxToken) {
      toast({
        title: "Missing Mapbox token",
        description: "Please enter your Mapbox token in the settings",
        variant: "destructive"
      });
      return;
    }
    
    if (!startLocation || !endLocation) {
      toast({
        title: "Missing locations",
        description: "Please provide both start and end locations",
        variant: "destructive"
      });
      return;
    }
    
    if (!startTime) {
      toast({
        title: "Missing departure time",
        description: "Please provide a departure time",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const waypointAddresses = waypoints.map(wp => wp.address).filter(address => address.trim() !== '');
      
      const routeResult = await calculateRoute(
        startLocation,
        endLocation,
        waypointAddresses,
        mapboxToken
      );
      
      if (routeResult) {
        // Format distance and duration for display
        const distanceInKm = (routeResult.distance / 1000).toFixed(1);
        const durationInMinutes = Math.round(routeResult.duration / 60);
        
        toast({
          title: "Route calculated",
          description: `Distance: ${distanceInKm} km, Duration: ${durationInMinutes} min`,
        });
        
        onRouteCalculated(routeResult, startTime);
      } else {
        toast({
          title: "Route calculation failed",
          description: "Unable to calculate route between these locations",
          variant: "destructive"
        });
        onRouteCalculated(null, startTime);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        title: "Error",
        description: "An error occurred while calculating the route",
        variant: "destructive"
      });
      onRouteCalculated(null, startTime);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Start Time</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={setTimeToNow}
              title="Set to current time"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <LocationInput
          value={startLocation}
          onChange={setStartLocation}
          placeholder="Start location"
          required
        />

        {waypoints.map((wp) => (
          <div key={wp.id} className="flex gap-2">
            <div className="flex-1">
              <LocationInput
                value={wp.address}
                onChange={(value) => {
                  const updated = waypoints.map(w =>
                    w.id === wp.id ? { ...w, address: value } : w
                  );
                  setWaypoints(updated);
                }}
                placeholder="Waypoint"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeWaypoint(wp.id)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <LocationInput
          value={endLocation}
          onChange={setEndLocation}
          placeholder="End location"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={addWaypoint}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Waypoint
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Calculating..." : "Calculate Route"}
        </Button>
      </div>
    </form>
  );
};

export default LocationForm;
