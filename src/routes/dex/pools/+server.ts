import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Handle OPTIONS request for CORS preflight
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: corsHeaders
  });
};

// Shared function to prepare parameters for the RPC call
function prepareRpcParams(params: Record<string, any>): Record<string, any> {
  const rpcParams: Record<string, any> = {};

  // Convert poolId to number if present
  if (params.poolId !== undefined && params.poolId !== null) {
    rpcParams.poolId = parseInt(String(params.poolId), 10);
    if (isNaN(rpcParams.poolId)) {
        throw new Error('Invalid poolId format. Must be a number.');
    }
  }

  // Pass tokenId as string if present
  if (params.tokenId !== undefined && params.tokenId !== null) {
    rpcParams.tokenId = String(params.tokenId);
  }

  // Pass nextToken as string if present
  if (params.nextToken !== undefined && params.nextToken !== null) {
    rpcParams.nextToken = String(params.nextToken);
  }

  // Pass exchange as string if present
  if (params.exchange !== undefined && params.exchange !== null) {
    rpcParams.exchange = String(params.exchange);
  }

  // Handle limit with default, min, and max constraints
  const defaultLimit = 50;
  const minLimit = 1;
  const maxLimit = 100;
  let limit = defaultLimit; // Default value
  if (params.limit !== undefined && params.limit !== null) {
      const requestedLimit = parseInt(String(params.limit), 10);
      if (!isNaN(requestedLimit)) {
          limit = Math.max(minLimit, Math.min(requestedLimit, maxLimit)); // Clamp between min and max
      } else {
          // Optional: throw error for invalid limit format, or just use default
          // throw new Error('Invalid limit format. Must be a number.');
          console.warn(`Invalid limit format received: ${params.limit}. Using default ${defaultLimit}.`);
      }
  }
  rpcParams.limit = limit;


  return rpcParams;
}


// Handle POST request for ARC200 pools with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();

    // Prepare parameters for RPC call
    const rpcParams = prepareRpcParams(requestParams);

    // Call the RPC function with parameters nested under 'params' key
    const { data, error } = await supabase.rpc('get_arc200_pools', { params: rpcParams });

    if (error) {
      console.error('Supabase RPC error (POST /dex/pools):', error);
      // Check for specific function-raised errors
      if (error.message.includes('Invalid')) {
         return json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
      throw error; // Re-throw other Supabase errors
    }

    // Return the data directly as the function returns the desired JSON structure
    return json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error fetching ARC200 pools (POST):', error);
    // Handle specific validation errors from prepareRpcParams
     if (error.message.startsWith('Invalid')) {
        return json({ error: error.message }, { status: 400, headers: corsHeaders });
     }
    // Generic internal server error for other cases
    return json({ error: 'Internal server error' }, {
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC200 pools
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const queryParams = {
      poolId: url.searchParams.get('poolId'),
      tokenId: url.searchParams.get('tokenId'),
      exchange: url.searchParams.get('exchange'),
      nextToken: url.searchParams.get('nextToken'),
      limit: url.searchParams.get('limit')
    };

    // Prepare parameters for RPC call
    const rpcParams = prepareRpcParams(queryParams);

    // Call the RPC function with parameters nested under 'params' key
    const { data, error } = await supabase.rpc('get_arc200_pools', { params: rpcParams });

    if (error) {
      console.error('Supabase RPC error (GET /dex/pools):', error);
       // Check for specific function-raised errors
      if (error.message.includes('Invalid')) {
         return json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
      throw error; // Re-throw other Supabase errors
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error fetching ARC200 pools (GET):', error);
     // Handle specific validation errors from prepareRpcParams
     if (error.message.startsWith('Invalid')) {
        return json({ error: error.message }, { status: 400, headers: corsHeaders });
     }
    // Generic internal server error
    return json({ error: 'Internal server error' }, {
      status: 500,
      headers: corsHeaders
    });
  }
}; 