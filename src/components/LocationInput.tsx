
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

interface Suggestion {
  place_name: string;
  id: string;
}

const LocationInput = ({ value, onChange, placeholder, required }: LocationInputProps) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const searchLocations = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const token = "pk.eyJ1IjoiY2FsbGVib2xsIiwiYSI6ImNtOGU5NXlvYzFtejMyanNoam1xbmRybzQifQ.WFffNsWCkKcPisEbZtEkig";
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&types=address,place,poi&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features.map((feature: any) => ({
        place_name: feature.place_name,
        id: feature.id,
      })));
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.place_name);
    onChange(suggestion.place_name);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10"
            placeholder={placeholder}
            required={required}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandList>
            {suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion.id}
                onSelect={() => handleSelectSuggestion(suggestion)}
                className="flex items-center gap-2 px-4 py-2"
              >
                <MapPin className="h-4 w-4" />
                {suggestion.place_name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationInput;
