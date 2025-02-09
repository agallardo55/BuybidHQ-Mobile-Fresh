
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface ColorsAndAccessoriesProps {
  formData: {
    exteriorColor: string;
    interiorColor: string;
    accessories: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ColorsAndAccessories = ({ formData, onChange }: ColorsAndAccessoriesProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleUpload = () => {
    console.log('Files to upload:', selectedFiles);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700 mb-1">
          Exterior Color
        </label>
        <Input
          id="exteriorColor"
          name="exteriorColor"
          type="text"
          value={formData.exteriorColor}
          onChange={onChange}
          required
          placeholder="Midnight Black"
        />
      </div>
      <div>
        <label htmlFor="interiorColor" className="block text-sm font-medium text-gray-700 mb-1">
          Interior Color
        </label>
        <Input
          id="interiorColor"
          name="interiorColor"
          type="text"
          value={formData.interiorColor}
          onChange={onChange}
          required
          placeholder="Black Leather"
        />
      </div>
      <div>
        <label htmlFor="accessories" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Equipment/Accessories
        </label>
        <Textarea
          id="accessories"
          name="accessories"
          value={formData.accessories}
          onChange={onChange}
          placeholder="List any additional equipment or accessories..."
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
            const conditionTab = document.querySelector('[value="condition"]') as HTMLElement;
            if (conditionTab) {
              conditionTab.click();
            }
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ColorsAndAccessories;

