
import { VehicleData } from "../types.ts";

export function handlePorscheSpecifics(data: VehicleData) {
  // Macan specific handling
  if (data.model === 'Macan') {
    if (data.trim.toLowerCase().includes('gts')) {
      data.engineCylinders = '2.9L V6 Turbo';
      data.transmission = '7-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche Macan GTS specs');
    } else if (data.trim.toLowerCase().includes('turbo')) {
      data.engineCylinders = '2.9L V6 Turbo';
      data.transmission = '7-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche Macan Turbo specs');
    }
  }
  // 911 specific handling
  else if (data.model === '911') {
    if (data.trim.toLowerCase().includes('turbo')) {
      data.engineCylinders = '3.8L 6-Cylinder Twin-Turbo';
      data.transmission = '8-Speed PDK';
      data.drivetrain = 'AWD';
      console.log('Set Porsche 911 Turbo specs');
    }
  }
}
