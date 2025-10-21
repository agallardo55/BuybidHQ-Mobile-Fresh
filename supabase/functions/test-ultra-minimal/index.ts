import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== ULTRA MINIMAL FUNCTION START ===');
  console.log('Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Function is working!');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Ultra minimal function works!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== ULTRA MINIMAL FUNCTION ERROR ===');
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Ultra minimal function error', 
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
