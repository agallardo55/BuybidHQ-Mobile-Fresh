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
          <Select value={filters.yearFrom} onValueChange={(value) => setFilters({ ...filters, yearFrom: value })}>
            <SelectTrigger id="yearFrom">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
              <SelectItem value="2017">2017</SelectItem>
              <SelectItem value="2016">2016</SelectItem>
              <SelectItem value="2015">2015</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Year To */}
        <div className="space-y-2">
          <Label htmlFor="yearTo">Year To</Label>
          <Select value={filters.yearTo} onValueChange={(value) => setFilters({ ...filters, yearTo: value })}>
            <SelectTrigger id="yearTo">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
              <SelectItem value="2017">2017</SelectItem>
              <SelectItem value="2016">2016</SelectItem>
            </SelectContent>
          </Select>
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
          <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="camry">Camry</SelectItem>
              <SelectItem value="accord">Accord</SelectItem>
              <SelectItem value="f-150">F-150</SelectItem>
              <SelectItem value="silverado">Silverado</SelectItem>
              <SelectItem value="altima">Altima</SelectItem>
              <SelectItem value="model-3">Model 3</SelectItem>
              <SelectItem value="civic">Civic</SelectItem>
              <SelectItem value="corolla">Corolla</SelectItem>
              <SelectItem value="rav4">RAV4</SelectItem>
              <SelectItem value="cr-v">CR-V</SelectItem>
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
