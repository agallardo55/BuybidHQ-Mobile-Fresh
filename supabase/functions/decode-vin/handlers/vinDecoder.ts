
import { fetchCarApiData } from "../api/carApi.ts";
import { processVehicleData } from "../processors/vehicleProcessor.ts";
import { ResponseResult } from "../types.ts";

export async function handleVinDecoding(vin: string): Promise<ResponseResult> {
  const apiResult = await fetchCarApiData(vin);

  if (!apiResult) {
    console.error("Failed to decode VIN from CarAPI");
    return {
      status: 500,
      data: { error: "Failed to decode VIN from CarAPI" }
    };
  }

  console.log('Raw vehicle data:', apiResult);
  
  // Process the vehicle data
  const processedData = processVehicleData(apiResult);
  
  console.log('Returning VIN decode response:', processedData);
  
  return {
    status: 200,
    data: processedData
  };
}
