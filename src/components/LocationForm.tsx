
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, Plus, X } from 'lucide-react';

interface Location {
  id: number;
  address: string;
}

const LocationForm = () => {
  const [startTime, setStartTime] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [waypoints, setWaypoints] = useState<Location[]>([]);

  const addWaypoint = () => {
    setWaypoints([...waypoints, { id: Date.now(), address: '' }]);
  };

  const removeWaypoint = (id: number) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle route calculation here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Start Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Start location"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="pl-10"
            required
          />
        </div>

        {waypoints.map((wp) => (
          <div key={wp.id} className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Waypoint"
              value={wp.address}
              onChange={(e) => {
                const updated = waypoints.map(w =>
                  w.id === wp.id ? { ...w, address: e.target.value } : w
                );
                setWaypoints(updated);
              }}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => removeWaypoint(wp.id)}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}

        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="End location"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="pl-10"
            required
          />
        </div>
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
        <Button type="submit" className="flex-1">
          Calculate Route
        </Button>
      </div>
    </form>
  );
};

export default LocationForm;
