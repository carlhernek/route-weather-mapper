import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenInputProps {
  showDirectInput?: boolean;
}

const TokenInput = ({ showDirectInput = false }: TokenInputProps) => {
  const [token, setToken] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load token from localStorage on initial render
    const savedToken = localStorage.getItem('mapboxToken') || '';
    setToken(savedToken);
  }, []);

  const handleSaveToken = () => {
    if (!token.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter a valid Mapbox token",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('mapboxToken', token);
    toast({
      title: "Token Saved",
      description: "Your Mapbox token has been saved"
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
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Mapbox token"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Your token is stored locally in your browser and is never sent to our servers.
          </p>
        </div>
        <Button onClick={handleSaveToken} className="w-full">
          Save Token
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
          <SheetTitle>Mapbox Settings</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mapbox Access Token</label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Your token is stored locally in your browser and is never sent to our servers.
            </p>
          </div>
          <Button onClick={handleSaveToken} className="w-full">
            Save Token
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TokenInput;
