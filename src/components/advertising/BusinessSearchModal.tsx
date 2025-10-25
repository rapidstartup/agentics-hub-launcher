import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Phone, Mail, ExternalLink } from "lucide-react";

interface BusinessSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  onBusinessSelected: (business: any) => void;
}

export const BusinessSearchModal = ({ isOpen, onClose, companyName, onBusinessSelected }: BusinessSearchModalProps) => {
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [autocompleteContainer, setAutocompleteContainer] = useState<HTMLDivElement | null>(null);

  const initAutocomplete = async (containerElement: HTMLDivElement) => {
    if (typeof google !== 'undefined' && google.maps?.places?.PlaceAutocompleteElement) {
      setupAutocomplete(containerElement);
      return;
    }

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) {
      toast({
        title: "Configuration Error",
        description: "Google Maps API key not configured",
        variant: "destructive"
      });
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setupAutocomplete(containerElement);
    };

    document.head.appendChild(script);
  };

  const setupAutocomplete = (containerElement: HTMLDivElement) => {
    const PlaceAutocompleteElement = (window as any).google.maps.places.PlaceAutocompleteElement;
    const autocompleteElement = new PlaceAutocompleteElement();
    autocompleteElement.id = 'place-autocomplete';
    
    containerElement.innerHTML = '';
    containerElement.appendChild(autocompleteElement);

    autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
      const place = event.place;
      await place.fetchFields({ fields: ['geometry', 'formattedAddress'] });
      
      if (place.geometry?.location) {
        setSelectedPlace({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formattedAddress
        });
        setLocation(place.formattedAddress);
      }
    });
  };

  const handleSearch = async () => {
    if (!selectedPlace) {
      toast({
        title: "Location required",
        description: "Please select a location from the dropdown",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('search-business', {
        body: {
          query: companyName,
          lat: selectedPlace.lat,
          lng: selectedPlace.lng
        }
      });

      if (error) throw error;

      if (data.businesses && data.businesses.length > 0) {
        setBusinesses(data.businesses);
      } else {
        toast({
          title: "No businesses found",
          description: "Please try a different name or location.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching business:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for business. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (business: any) => {
    onBusinessSelected(business);
    onClose();
    setBusinesses([]);
    setLocation("");
    setSelectedPlace(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search for "{companyName}"</DialogTitle>
        </DialogHeader>
        
        {businesses.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter your business location
              </label>
              <div 
                ref={(el) => {
                  if (el && !autocompleteContainer) {
                    setAutocompleteContainer(el);
                    initAutocomplete(el);
                  }
                }}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !location}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {businesses.map((business, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleSelect(business)}
              >
                <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {business.full_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{business.full_address}</span>
                    </div>
                  )}
                  {business.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{business.phone_number}</span>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span>{business.email}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{business.website}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
