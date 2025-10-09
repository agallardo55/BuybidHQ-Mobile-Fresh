import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MarketplaceFiltersProps {
  filters: {
    make: string;
    model: string;
    yearFrom: string;
    yearTo: string;
    priceFrom: string;
    priceTo: string;
    mileageFrom: string;
    mileageTo: string;
  };
  setFilters: (filters: any) => void;
  availableMakes: string[];
  availableModels: string[];
  availableYears: string[];
}

const MarketplaceFilters = ({ filters, setFilters, availableMakes, availableModels, availableYears }: MarketplaceFiltersProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
      
      {/* Filter Row - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year From */}
        <div className="space-y-2">
          <Label htmlFor="yearFrom">Year From</Label>
          <Select value={filters.yearFrom} onValueChange={(value) => setFilters({ ...filters, yearFrom: value })}>
            <SelectTrigger id="yearFrom">
              <SelectValue placeholder="ANY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ANY</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year To */}
        <div className="space-y-2">
          <Label htmlFor="yearTo">Year To</Label>
          <Select value={filters.yearTo} onValueChange={(value) => setFilters({ ...filters, yearTo: value })}>
            <SelectTrigger id="yearTo">
              <SelectValue placeholder="ANY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ANY</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Select 
            value={filters.make} 
            onValueChange={(value) => {
              // Reset model when make changes
              setFilters({ ...filters, make: value, model: "all" });
            }}
          >
            <SelectTrigger id="make">
              <SelectValue placeholder="ANY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ANY</SelectItem>
              {availableMakes.map((make) => (
                <SelectItem key={make} value={make.toLowerCase()}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })}>
            <SelectTrigger id="model">
              <SelectValue placeholder="ANY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ANY</SelectItem>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model.toLowerCase()}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price From */}
        <div className="space-y-2">
          <Label htmlFor="priceFrom">Min Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="priceFrom"
              type="text"
              placeholder="20,000"
              value={filters.priceFrom ? parseInt(filters.priceFrom).toLocaleString('en-US') : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFilters({ ...filters, priceFrom: value });
              }}
              className="pl-7"
            />
          </div>
        </div>

        {/* Price To */}
        <div className="space-y-2">
          <Label htmlFor="priceTo">Max Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="priceTo"
              type="text"
              placeholder="50,000"
              value={filters.priceTo ? parseInt(filters.priceTo).toLocaleString('en-US') : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setFilters({ ...filters, priceTo: value });
              }}
              className="pl-7"
            />
          </div>
        </div>

        {/* Mileage From */}
        <div className="space-y-2">
          <Label htmlFor="mileageFrom">Min Mileage</Label>
          <Input
            id="mileageFrom"
            type="text"
            placeholder="0"
            value={filters.mileageFrom ? parseInt(filters.mileageFrom).toLocaleString('en-US') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFilters({ ...filters, mileageFrom: value });
            }}
          />
        </div>

        {/* Mileage To */}
        <div className="space-y-2">
          <Label htmlFor="mileageTo">Max Mileage</Label>
          <Input
            id="mileageTo"
            type="text"
            placeholder="50,000"
            value={filters.mileageTo ? parseInt(filters.mileageTo).toLocaleString('en-US') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFilters({ ...filters, mileageTo: value });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
