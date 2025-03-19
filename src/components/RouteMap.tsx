
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RoutePoint, RouteResult } from '@/utils/routeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Cloud, CloudRain, Sun, CloudLightning, CloudSnow, CloudFog, CloudSun, Moon, CloudMoon, CloudDrizzle } from 'lucide-react';
import TokenInput from './TokenInput';
import { WeatherCheckpoint } from '@/utils/weatherUtils';

interface RouteMapProps {
  routeData?: RouteResult | null;
  weatherData?: WeatherCheckpoint[] | null;
}

const RouteMap = ({ routeData, weatherData }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  
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

  // Effect to add weather pins to the map
  useEffect(() => {
    if (!map.current || !mapLoaded || !weatherData) return;

    // Remove existing weather markers
    const weatherMarkers = document.getElementsByClassName('weather-marker');
    while (weatherMarkers[0]) {
      weatherMarkers[0].remove();
    }
    
    // Add weather markers
    weatherData.forEach((checkpoint, index) => {
      // Skip first and last checkpoints as they're covered by the route markers
      if (index !== 0 && index !== weatherData.length - 1) {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'weather-marker';
        
        const tempColor = checkpoint.weather.temperature > 25 ? 'text-red-500' : 
                         checkpoint.weather.temperature < 5 ? 'text-blue-500' : 'text-yellow-500';
        
        el.innerHTML = `
          <div class="bg-white/80 backdrop-filter backdrop-blur-sm border border-gray-200 rounded-lg p-1 shadow-md">
            <div class="flex items-center justify-center">
              <div class="w-6 h-6 flex items-center justify-center ${tempColor} font-semibold text-xs">
                ${checkpoint.weather.temperature}°
              </div>
            </div>
          </div>
        `;
        
        // Create popup with detailed weather info
        const popupHtml = `
          <div class="text-sm">
            <p class="font-semibold">${new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            }).format(checkpoint.arrivalTime)}</p>
            <p>${checkpoint.weather.condition}</p>
            <p>${checkpoint.weather.temperature}°C</p>
            <p>Humidity: ${checkpoint.weather.humidity}%</p>
            <p>Wind: ${checkpoint.weather.wind} km/h</p>
          </div>
        `;
        
        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(checkpoint.weather.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(popupHtml))
          .addTo(map.current);
      }
    });
  }, [weatherData, mapLoaded]);

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
      className="w-full h-full rounded-lg border"
    />
  );
};

export default RouteMap;
