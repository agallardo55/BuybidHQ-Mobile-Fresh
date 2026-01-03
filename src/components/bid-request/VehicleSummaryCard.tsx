import { BidRequestFormData } from "./types";

interface VehicleSummaryCardProps {
  formData: BidRequestFormData;
  uploadedImageUrls?: string[];
}

export const VehicleSummaryCard = ({
  formData,
  uploadedImageUrls = []
}: VehicleSummaryCardProps) => {
  const hasBasicInfo = formData.year || formData.make || formData.model;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
          Vehicle Summary
        </h3>
      </div>

      {/* Primary Image */}
      {uploadedImageUrls[0] ? (
        <div className="aspect-video w-full bg-slate-100">
          <img
            src={uploadedImageUrls[0]}
            alt="Vehicle primary"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-slate-50 flex items-center justify-center border-b border-slate-100">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">No image uploaded</p>
        </div>
      )}

      {/* Vehicle Identity - Vertical Stack */}
      <div className="p-6 space-y-4">
        {/* VIN */}
        {formData.vin && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              VIN
            </label>
            <code className="text-[13px] font-mono text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200 block break-all">
              {formData.vin}
            </code>
          </div>
        )}

        {/* Year Make Model */}
        {hasBasicInfo ? (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Vehicle
            </label>
            <p className="text-[15px] font-semibold text-slate-900">
              {formData.year || 'Year'} {formData.make || 'Make'} {formData.model || 'Model'}
            </p>
            {formData.displayTrim && (
              <p className="text-[13px] text-slate-600 mt-1">
                {formData.displayTrim}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Vehicle
            </label>
            <p className="text-[13px] text-slate-400">Enter VIN to decode vehicle details</p>
          </div>
        )}

        {/* Mileage */}
        {formData.mileage && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Mileage
            </label>
            <p className="text-[13px] text-slate-900">
              {parseInt(formData.mileage).toLocaleString()} miles
            </p>
          </div>
        )}

        {/* Drivetrain & Transmission */}
        {(formData.drivetrain || formData.transmission) && (
          <div className="grid grid-cols-2 gap-3">
            {formData.drivetrain && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Drive
                </label>
                <p className="text-[13px] text-slate-900">
                  {formData.drivetrain}
                </p>
              </div>
            )}
            {formData.transmission && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Trans
                </label>
                <p className="text-[13px] text-slate-900">
                  {formData.transmission}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Engine */}
        {formData.engineCylinders && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Engine
            </label>
            <p className="text-[13px] text-slate-900">
              {formData.engineCylinders}
            </p>
          </div>
        )}

        {/* Body Style */}
        {formData.bodyStyle && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Body Style
            </label>
            <p className="text-[13px] text-slate-900">
              {formData.bodyStyle}
            </p>
          </div>
        )}

        {/* Colors */}
        {(formData.exteriorColor || formData.interiorColor) && (
          <div className="pt-3 border-t border-slate-100">
            <div className="space-y-3">
              {formData.exteriorColor && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Exterior
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-slate-300"
                      style={{ backgroundColor: formData.exteriorColor.toLowerCase() }}
                    />
                    <span className="text-[13px] text-slate-900">
                      {formData.exteriorColor}
                    </span>
                  </div>
                </div>
              )}
              {formData.interiorColor && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Interior
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-slate-300"
                      style={{ backgroundColor: formData.interiorColor.toLowerCase() }}
                    />
                    <span className="text-[13px] text-slate-900">
                      {formData.interiorColor}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Thumbnails */}
      {uploadedImageUrls.length > 1 && (
        <div className="px-6 pb-6">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Images ({uploadedImageUrls.length})
          </label>
          <div className="grid grid-cols-4 gap-2">
            {uploadedImageUrls.slice(0, 8).map((url, index) => (
              <div
                key={index}
                className="aspect-square rounded border border-slate-200 overflow-hidden bg-slate-50"
              >
                <img
                  src={url}
                  alt={`Vehicle ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {uploadedImageUrls.length > 8 && (
            <p className="text-[10px] text-slate-500 mt-2">
              +{uploadedImageUrls.length - 8} more images
            </p>
          )}
        </div>
      )}
    </div>
  );
};
