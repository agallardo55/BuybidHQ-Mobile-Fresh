
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface VehicleConditionProps {
  formData: {
    windshield: string;
    engineLights: string;
    brakes: string;
    tire: string;
    maintenance: string;
    reconEstimate: string;
    reconDetails: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
}

const VehicleCondition = ({ formData, onChange, onSelectChange }: VehicleConditionProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleUpload = () => {
    // Here you would typically handle the upload process
    console.log('Files to upload:', selectedFiles);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="windshield" className="block text-sm font-medium text-gray-700 mb-1">
          Windshield
        </label>
        <Select name="windshield" onValueChange={(value) => onSelectChange(value, "windshield")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="engineLights" className="block text-sm font-medium text-gray-700 mb-1">
          Engine Lights
        </label>
        <Select name="engineLights" onValueChange={(value) => onSelectChange(value, "engineLights")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="on">On</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="brakes" className="block text-sm font-medium text-gray-700 mb-1">
          Brakes
        </label>
        <Select name="brakes" onValueChange={(value) => onSelectChange(value, "brakes")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="tire" className="block text-sm font-medium text-gray-700 mb-1">
          Tire
        </label>
        <Select name="tire" onValueChange={(value) => onSelectChange(value, "tire")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="maintenance" className="block text-sm font-medium text-gray-700 mb-1">
          Maintenance
        </label>
        <Select name="maintenance" onValueChange={(value) => onSelectChange(value, "maintenance")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose One" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upToDate">Up to Date</SelectItem>
            <SelectItem value="needsService">Needs Service</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="reconEstimate" className="block text-sm font-medium text-gray-700 mb-1">
          Recon Estimate ($)
        </label>
        <Input
          id="reconEstimate"
          name="reconEstimate"
          type="number"
          value={formData.reconEstimate}
          onChange={onChange}
          placeholder="0"
        />
      </div>

      <div>
        <label htmlFor="reconDetails" className="block text-sm font-medium text-gray-700 mb-1">
          Recon Details
        </label>
        <Textarea
          id="reconDetails"
          name="reconDetails"
          value={formData.reconDetails}
          onChange={onChange}
          placeholder="Enter reconditioning details..."
          className="min-h-[100px]"
        />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            Add Photo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <label 
                htmlFor="photos" 
                className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Click to select photos or drag and drop
                  </span>
                  <span className="text-xs text-gray-400">
                    Support for multiple photos
                  </span>
                </div>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              
              {selectedFiles.length > 0 && (
                <div className="w-full">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleUpload} 
                className="w-full"
                disabled={selectedFiles.length === 0}
              >
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="pt-6">
        <Button 
          type="button"
          className="w-full bg-custom-blue hover:bg-custom-blue/90"
          onClick={() => {
            document.querySelector('[value="buyers"]')?.dispatchEvent(
              new MouseEvent('click', { bubbles: true })
            );
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default VehicleCondition;

