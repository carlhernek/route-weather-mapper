
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TokenInputProps {
  showDirectInput?: boolean;
}

const TokenInput = ({ showDirectInput = false }: TokenInputProps) => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [weatherToken, setWeatherToken] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load tokens from localStorage on initial render
    const savedMapboxToken = localStorage.getItem('mapboxToken') || '';
    const savedWeatherToken = localStorage.getItem('weatherToken') || '';
    setMapboxToken(savedMapboxToken);
    setWeatherToken(savedWeatherToken);
  }, []);

  const handleSaveTokens = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Mapbox Token Required",
        description: "Please enter a valid Mapbox token",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('mapboxToken', mapboxToken);
    localStorage.setItem('weatherToken', weatherToken);
    
    toast({
      title: "Tokens Saved",
      description: "Your API tokens have been saved",
    });
    
    // Reload the page to reinitialize the map with the new token
    window.location.reload();
  };

  if (showDirectInput) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mapbox Access Token</label>
          <Input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="Enter your Mapbox token"
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">OpenWeather API Key</label>
          <Input
            type="text"
            value={weatherToken}
            onChange={(e) => setWeatherToken(e.target.value)}
            placeholder="Enter your OpenWeather API key"
            className="font-mono text-xs"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Your tokens are stored locally in your browser and are never sent to our servers.
        </p>
        <Button onClick={handleSaveTokens} className="w-full">
          Save Tokens
        </Button>
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>API Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <Tabs defaultValue="mapbox">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mapbox">Mapbox</TabsTrigger>
              <TabsTrigger value="weather">OpenWeather</TabsTrigger>
            </TabsList>
            <TabsContent value="mapbox" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mapbox Access Token</label>
                <Input
                  type="text"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="Enter your Mapbox token"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Required for map display and routing functionality.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="weather" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OpenWeather API Key</label>
                <Input
                  type="text"
                  value={weatherToken}
                  onChange={(e) => setWeatherToken(e.target.value)}
                  placeholder="Enter your OpenWeather API key"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Required for accurate weather forecasts along your route.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground">
            Your tokens are stored locally in your browser and are never sent to our servers.
          </p>
          <Button onClick={handleSaveTokens} className="w-full">
            Save Tokens
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TokenInput;
