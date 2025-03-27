
import { CarApiResult } from "../types.ts";

export function handlePorscheSpecialTrims(vehicleData: CarApiResult, uniqueTrims: any[]): any[] {
  // Special handling for Porsche vehicles AFTER deduplication
  let finalTrims = [...uniqueTrims];
  
  if (vehicleData.make?.toLowerCase() === 'porsche') {
    // Log all relevant specs for GT3 RS detection
    console.log('Checking Porsche GT3 RS specs:', {
      displacement: vehicleData.specs?.displacement_l,
      cylinders: vehicleData.specs?.engine_number_of_cylinders,
      bodyClass: vehicleData.specs?.body_class,
      doors: vehicleData.specs?.doors,
      series: vehicleData.specs?.series,
      trim: vehicleData.specs?.trim
    });

    // More lenient GT3 RS detection
    const isGT3RS = (
      // Engine specs (4.0L, 6cyl)
      (vehicleData.specs?.displacement_l === "4" || vehicleData.specs?.displacement_l === "4.0") &&
      vehicleData.specs?.engine_number_of_cylinders === "6" &&
      // Body type checks (coupe/2-door)
      (vehicleData.specs?.body_class?.toLowerCase().includes('coupe') || 
       vehicleData.specs?.doors === "2") ||
      // Additional checks for series or trim indicators
      vehicleData.specs?.series?.toLowerCase().includes('gt3') ||
      vehicleData.specs?.trim?.toLowerCase().includes('gt3')
    );

    // Check if GT3 RS is already in the trims
    const hasGT3RS = uniqueTrims.some(trim => {
      const name = (trim.name || '').toLowerCase();
      const desc = (trim.description || '').toLowerCase();
      const isGT3RS = name.includes('gt3') && name.includes('rs') ||
                     desc.includes('gt3') && desc.includes('rs');
      if (isGT3RS) {
        console.log('Found existing GT3 RS trim:', trim);
      }
      return isGT3RS;
    });

    console.log('GT3 RS detection results:', { isGT3RS, hasGT3RS });

    // Force add GT3 RS if detected but not in trims
    if (isGT3RS && !hasGT3RS) {
      console.log('Adding GT3 RS trim to list');
      finalTrims = [
        {
          name: 'GT3 RS',
          description: 'GT3 RS 2dr Coupe (4.0L 6cyl 7AM)',
          year: Number(vehicleData.year)
        },
        ...uniqueTrims
      ];
    }
  }

  console.log('Final trims after GT3 RS handling:', finalTrims);
  return finalTrims;
}
