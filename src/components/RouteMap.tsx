import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RoutePoint } from '@/utils/routeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import TokenInput from './TokenInput';

interface RouteMapProps {
  routeData?: {
    route: GeoJSON.FeatureCollection;
    waypoints: RoutePoint[];
  } | null;
}

const RouteMap = ({ routeData }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  
  useEffect(() => {
    if (!mapContainer.current) return;

    // Get token from localStorage
    const accessToken = localStorage.getItem('mapboxToken');
    
    if (!accessToken) {
      setTokenMissing(true);
      return;
    }
    
    setTokenMissing(false);
    
    // Initialize map
    mapboxgl.accessToken = accessToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40],
        zoom: 9,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenMissing(true);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Effect to add or update route data on the map
  useEffect(() => {
    if (!map.current || !mapLoaded || !routeData) return;

    // Check if source already exists and remove it
    if (map.current.getSource('route')) {
      map.current.removeLayer('route-line');
      map.current.removeSource('route');
    }

    // Add route source and layer
    map.current.addSource('route', {
      type: 'geojson',
      data: routeData.route
    });

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each waypoint
    routeData.waypoints.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === routeData.waypoints.length - 1;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';
      el.style.width = '30px';
      el.style.height = '30px';
      
      if (isStart) {
        el.innerHTML = `<div class="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">S</div>`;
      } else if (isEnd) {
        el.innerHTML = `<div class="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">E</div>`;
      } else {
        el.innerHTML = `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">${index}</div>`;
      }
      
      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat(point.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(point.name))
        .addTo(map.current);
    });

    // Fit map to route bounds
    if (routeData.waypoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routeData.waypoints.forEach(point => {
        bounds.extend(point.coordinates);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [routeData, mapLoaded]);

  if (tokenMissing) {
    return (
      <div className="rounded-lg border p-4 space-y-4">
        <Alert>
          <AlertDescription>
            Please enter your Mapbox token below to use the map
          </AlertDescription>
        </Alert>
        <TokenInput showDirectInput={true} />
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-lg border"
    />
  );
};

export default RouteMap;
