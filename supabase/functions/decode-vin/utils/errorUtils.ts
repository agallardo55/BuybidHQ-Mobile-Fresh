
import { corsHeaders } from "../config.ts";

export function handleVinError(error: unknown, status = 400) {
  console.error('VIN Error:', error);
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to decode VIN',
      details: 'Unexpected error occurred'
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error instanceof Error ? error.message : error);
  return new Response(
    JSON.stringify({ 
      error: 'Failed to decode VIN. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown API error'
    }),
    { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
