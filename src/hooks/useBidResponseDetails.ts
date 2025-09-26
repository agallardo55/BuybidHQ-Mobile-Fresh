
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface BidResponseDetailsType {
  request_id: string;
  created_at: string;
  status: string;
  year: string;
  make: string;
  model: string;
  trim_level: string;
  vin: string;
  mileage: string;
  user_full_name: string;
  engine_cylinders: string;
  transmission: string;
  drivetrain: string;
  exterior_color: string;
  interior_color: string;
  accessories: string;
  windshield: string;
  engine_lights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  recon_estimate: string;
  recon_details: string;
  dealership: string | null;
  mobile_number: string | null;
  images: string[];
}

export const useBidResponseDetails = () => {
  const { id } = useParams();

  return useQuery({
    queryKey: ['bidResponse', id],
    queryFn: async () => {
      // Handle preview mode or invalid ID by returning mock data
      if (!id || id === ':id' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('Using mock data for preview mode or invalid ID:', id);
        return {
          requestId: 'mock-request-id',
          createdAt: new Date(),
          status: 'active',
          vehicle: {
            year: 2024,
            make: 'Toyota',
            model: 'Camry',
            trim: 'XSE',
            vin: '1HGCM82633A123456',
            mileage: 15000,
            engineCylinders: '4 Cylinder',
            transmission: 'Automatic',
            drivetrain: 'FWD',
            exteriorColor: 'Midnight Black',
            interiorColor: 'Black Leather',
            accessories: 'Premium Package, Navigation, Sunroof',
            windshield: 'Excellent',
            engineLights: 'None',
            brakes: 'Good',
            tire: 'Good',
            maintenance: 'Up to Date',
            reconEstimate: '2500',
            reconDetails: 'Minor paint correction needed on rear bumper. All mechanical systems in excellent condition.',
            images: [] // Empty array to test placeholder
          },
          buyer: {
            name: 'John Smith',
            dealership: 'Premium Motors',
            mobileNumber: '(555) 123-4567'
          }
        };
      }

      try {
        // First get the bid request details
        const { data: requestDetails, error: requestError } = await supabase
          .rpc('get_bid_request_details', {
            p_request_id: id
          });

        if (requestError) {
          console.error('Error fetching bid response details:', requestError);
          throw requestError;
        }

        if (!requestDetails || requestDetails.length === 0) {
          throw new Error('No bid response found');
        }

        // Then get the images for this bid request, ordered by sequence_order and created_at
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', id)
          .order('sequence_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true });

        if (imageError) {
          console.error('Error fetching images:', imageError);
        }

        const details = requestDetails[0] as BidResponseDetailsType;
        const images = imageData?.map(img => img.image_url).filter((url): url is string => url !== null);

        return {
          requestId: details.request_id,
          createdAt: new Date(details.created_at),
          status: details.status,
          vehicle: {
            year: parseInt(details.year),
            make: details.make,
            model: details.model,
            trim: details.trim_level,
            vin: details.vin,
            mileage: parseInt(details.mileage),
            engineCylinders: details.engine_cylinders,
            transmission: details.transmission,
            drivetrain: details.drivetrain,
            exteriorColor: details.exterior_color,
            interiorColor: details.interior_color,
            accessories: details.accessories,
            windshield: details.windshield,
            engineLights: details.engine_lights,
            brakes: details.brakes,
            tire: details.tire,
            maintenance: details.maintenance,
            reconEstimate: details.recon_estimate,
            reconDetails: details.recon_details,
            images: images || []
          },
          buyer: {
            name: details.user_full_name,
            dealership: details.dealership || 'N/A',
            mobileNumber: details.mobile_number || 'N/A'
          }
        };
      } catch (error) {
        // Fallback to mock data if there's any error
        console.error('Database error, using mock data:', error);
        return {
          requestId: 'fallback-request-id',
          createdAt: new Date(),
          status: 'active',
          vehicle: {
            year: 2024,
            make: 'Honda',
            model: 'Accord',
            trim: 'Sport',
            vin: '1HGCV1F30NA123456',
            mileage: 25000,
            engineCylinders: '4 Cylinder Turbo',
            transmission: 'CVT',
            drivetrain: 'FWD',
            exteriorColor: 'Still Night Pearl',
            interiorColor: 'Black Cloth',
            accessories: 'Sport Package, Honda Sensing',
            windshield: 'Good',
            engineLights: 'None',
            brakes: 'Excellent',
            tire: 'Good',
            maintenance: 'Up to Date',
            reconEstimate: '1500',
            reconDetails: 'Vehicle is in excellent condition with minor wear on driver seat.',
            images: [] // Empty array to test placeholder
          },
          buyer: {
            name: 'Sarah Johnson',
            dealership: 'City Honda',
            mobileNumber: '(555) 987-6543'
          }
        };
      }
    },
    enabled: !!id
  });
};
