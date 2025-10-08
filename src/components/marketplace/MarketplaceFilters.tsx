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
}

const MarketplaceFilters = ({ filters, setFilters }: MarketplaceFiltersProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
      
      {/* Filter Row - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year From */}
        <div className="space-y-2">
          <Label htmlFor="yearFrom">Year From</Label>
          <Input
            id="yearFrom"
            type="number"
            placeholder="2020"
            value={filters.yearFrom}
            onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
          />
        </div>

        {/* Year To */}
        <div className="space-y-2">
          <Label htmlFor="yearTo">Year To</Label>
          <Input
            id="yearTo"
            type="number"
            placeholder="2024"
            value={filters.yearTo}
            onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
          />
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Select value={filters.make} onValueChange={(value) => setFilters({ ...filters, make: value })}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="honda">Honda</SelectItem>
              <SelectItem value="ford">Ford</SelectItem>
              <SelectItem value="chevrolet">Chevrolet</SelectItem>
              <SelectItem value="nissan">Nissan</SelectItem>
              <SelectItem value="tesla">Tesla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="Enter model"
            value={filters.model}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
          />
        </div>

        {/* Price From */}
        <div className="space-y-2">
          <Label htmlFor="priceFrom">Min Price</Label>
          <Input
            id="priceFrom"
            type="number"
            placeholder="20000"
            value={filters.priceFrom}
            onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
          />
        </div>

        {/* Price To */}
        <div className="space-y-2">
          <Label htmlFor="priceTo">Max Price</Label>
          <Input
            id="priceTo"
            type="number"
            placeholder="50000"
            value={filters.priceTo}
            onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
          />
        </div>

        {/* Mileage From */}
        <div className="space-y-2">
          <Label htmlFor="mileageFrom">Min Mileage</Label>
          <Input
            id="mileageFrom"
            type="number"
            placeholder="0"
            value={filters.mileageFrom}
            onChange={(e) => setFilters({ ...filters, mileageFrom: e.target.value })}
          />
        </div>

        {/* Mileage To */}
        <div className="space-y-2">
          <Label htmlFor="mileageTo">Max Mileage</Label>
          <Input
            id="mileageTo"
            type="number"
            placeholder="50000"
            value={filters.mileageTo}
            onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
