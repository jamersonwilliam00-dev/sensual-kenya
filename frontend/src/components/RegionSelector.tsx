import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface RegionSelectorProps {
  onSelect: (charge: number, region: string) => void;
  selectedRegion?: string;
}

// Comprehensive delivery pricing based on CBD Errands structure
const DELIVERY_REGIONS = [
  // CBD - Free/Lowest Cost
  { name: 'CBD Errands', charge: 100, area: 'Nairobi CBD' },
  { name: 'Pickup Shelf', charge: 0, area: 'Dynamic Mall 5th Floor Shop Ml212, Nairobi CBD' },
  
  // NGONG ROAD
  { name: 'Upperhill', charge: 300, area: 'Ngong Road' },
  
  // LIMURU ROAD
  { name: 'Hurlingham', charge: 300, area: 'Limuru Road' },
  { name: 'Ngara', charge: 250, area: 'Limuru Road' },
  { name: 'Mbagathi', charge: 300, area: 'Limuru Road' },
  { name: 'Parklands', charge: 300, area: 'Limuru Road' },
  { name: 'Yaya Center', charge: 300, area: 'Limuru Road' },
  { name: 'Kilimani', charge: 300, area: 'Limuru Road' },
  { name: 'Kileleshwa', charge: 300, area: 'Limuru Road' },
  { name: 'Muthaiga', charge: 350, area: 'Limuru Road' },
  { name: 'Karura', charge: 350, area: 'Limuru Road' },
  { name: 'Lavington', charge: 350, area: 'Limuru Road' },
  { name: 'Riara/Adams', charge: 350, area: 'Limuru Road' },
  { name: 'Racecourse', charge: 400, area: 'Limuru Road' },
  { name: 'Gigiri/V. Market', charge: 450, area: 'Limuru Road' },
  { name: 'Roseline', charge: 450, area: 'Limuru Road' },
  { name: 'Ruaka', charge: 500, area: 'Limuru Road' },
  { name: 'Banana', charge: 600, area: 'Limuru Road' },
  { name: 'Ngong', charge: 800, area: 'Limuru Road' },
  
  // WAIYAKI WAY / WESTLANDS AREA
  { name: 'Wayaki Way', charge: 300, area: 'Waiyaki Way' },
  { name: 'Westland', charge: 300, area: 'Waiyaki Way' },
  { name: 'Spring Valley', charge: 300, area: 'Waiyaki Way' },
  { name: 'N. West/Madaraka', charge: 300, area: 'Waiyaki Way' },
  { name: 'Loresho/Kangemi', charge: 300, area: 'Waiyaki Way' },
  { name: 'Wilson/Carnivore', charge: 300, area: 'Waiyaki Way' },
  
  // LANGATA ROAD
  { name: 'Langata Rd', charge: 300, area: 'Langata Road' },
  { name: 'M.View', charge: 350, area: 'Langata Road' },
  { name: 'Langata', charge: 450, area: 'Langata Road' },
  { name: 'Bomas', charge: 450, area: 'Langata Road' },
  { name: 'Uthiru/L. Kabete', charge: 450, area: 'Langata Road' },
  { name: 'Karen', charge: 500, area: 'Langata Road' },
  { name: 'Muthiga/Regen', charge: 500, area: 'Langata Road' },
  { name: 'Kitsuru', charge: 600, area: 'Langata Road' },
  { name: 'Kikuyu', charge: 650, area: 'Langata Road' },
  { name: 'Kiserian', charge: 650, area: 'Langata Road' },
  { name: 'Rongai', charge: 700, area: 'Langata Road' },
  { name: 'Sigona', charge: 900, area: 'Langata Road' },
  
  // MOMBASA ROAD
  { name: 'South B/C', charge: 300, area: 'Mombasa Road' },
  { name: 'Imara', charge: 350, area: 'Mombasa Road' },
  { name: 'GM/Industrial Area', charge: 350, area: 'Mombasa Road' },
  { name: 'Syokimau', charge: 500, area: 'Mombasa Road' },
  { name: 'Cabanas', charge: 600, area: 'Mombasa Road' },
  { name: 'JKIA', charge: 650, area: 'Mombasa Road' },
  { name: 'Katani', charge: 700, area: 'Mombasa Road' },
  { name: 'Mlolongo', charge: 800, area: 'Mombasa Road' },
  { name: 'Athi River/Kitengela', charge: 900, area: 'Mombasa Road' },
  
  // THIKA ROAD
  { name: 'Pangani', charge: 250, area: 'Thika Road' },
  { name: 'Eastleigh', charge: 300, area: 'Thika Road' },
  { name: 'Airtel/Panari', charge: 350, area: 'Thika Road' },
  { name: 'Allsoaps', charge: 400, area: 'Thika Road' },
  { name: 'Mwiki/Kahawa', charge: 500, area: 'Thika Road' },
  { name: 'Kasarani', charge: 600, area: 'Thika Road' },
  { name: 'KU', charge: 650, area: 'Thika Road' },
  { name: 'Ruiru', charge: 800, area: 'Thika Road' },
  { name: 'Juja', charge: 900, area: 'Thika Road' },
  { name: 'Thika', charge: 1000, area: 'Thika Road' },
  
  // JOGOO ROAD
  { name: 'City Stadium', charge: 300, area: 'Jogoo Road' },
  { name: 'Uchumi/Makadara', charge: 300, area: 'Jogoo Road' },
  { name: 'Donholm/Pipeline', charge: 400, area: 'Jogoo Road' },
  
  // KIAMBU ROAD
  { name: 'Muthaiga (Kiambu Rd)', charge: 350, area: 'Kiambu Road' },
  { name: 'Runda', charge: 400, area: 'Kiambu Road' },
  { name: 'N. Bypass', charge: 400, area: 'Kiambu Road' },
  { name: 'Ridgeways', charge: 600, area: 'Kiambu Road' },
  { name: 'Thindigua', charge: 800, area: 'Kiambu Road' },
];

// Group regions by area for organized display
const AREAS = [
  'Nairobi CBD',
  'Ngong Road',
  'Limuru Road',
  'Waiyaki Way',
  'Langata Road',
  'Mombasa Road',
  'Thika Road',
  'Jogoo Road',
  'Kiambu Road'
];

export function RegionSelector({ onSelect, selectedRegion }: RegionSelectorProps) {
  const handleRegionChange = (regionName: string) => {
    const region = DELIVERY_REGIONS.find(r => r.name === regionName);
    if (region) {
      onSelect(region.charge, region.name);
    }
  };

  const selectedRegionData = DELIVERY_REGIONS.find(r => r.name === selectedRegion);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Your Location</Label>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your area" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {AREAS.map((area) => {
                const regionsInArea = DELIVERY_REGIONS.filter(r => r.area === area);
                if (regionsInArea.length === 0) return null;

                return (
                  <div key={area}>
                    <div className="px-2 py-1.5 text-xs font-medium text-primary sticky top-0 bg-background">
                      {area}
                    </div>
                    {regionsInArea.map((region) => (
                      <SelectItem key={region.name} value={region.name}>
                        <div className="flex justify-between items-center w-full">
                          <span>{region.name}</span>
                          <span className="text-xs text-muted-foreground ml-4">
                            KSh {region.charge}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedRegionData && (
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Delivery Charge</p>
            <p className="text-2xl text-primary">KSh {selectedRegionData.charge.toLocaleString()}</p>
            <Badge variant="secondary" className="mt-2">{selectedRegionData.name}</Badge>
            <p className="text-xs text-muted-foreground mt-2">{selectedRegionData.area}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Discreet delivery • 1-2 business days within Nairobi
        </p>
      </CardContent>
    </Card>
  );
}
