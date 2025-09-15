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
function prepareRpcParams(params: Record<string, any>): { 
  p_app_id: number; 
  p_start_ts: string; 
  p_end_ts: string; 
  p_limit?: number; 
  p_min_spins?: number; 
  p_min_volume_micro?: number; 
} {
  const rpcParams: { 
    p_app_id?: number; 
    p_start_ts?: string; 
    p_end_ts?: string; 
    p_limit?: number; 
    p_min_spins?: number; 
    p_min_volume_micro?: number; 
  } = {};

  // Convert appId to number if present
  if (params.appId !== undefined && params.appId !== null) {
    rpcParams.p_app_id = parseInt(String(params.appId), 10);
    if (isNaN(rpcParams.p_app_id)) {
        throw new Error('Invalid appId format. Must be a number.');
    }
  } else {
    throw new Error('appId is required');
  }

  // Handle start timestamp
  if (params.startTs !== undefined && params.startTs !== null) {
    const startTs = String(params.startTs);
    // Validate ISO timestamp format
    if (isNaN(Date.parse(startTs))) {
      throw new Error('Invalid startTs format. Must be a valid ISO timestamp.');
    }
    rpcParams.p_start_ts = startTs;
  } else {
    throw new Error('startTs is required');
  }

  // Handle end timestamp
  if (params.endTs !== undefined && params.endTs !== null) {
    const endTs = String(params.endTs);
    // Validate ISO timestamp format
    if (isNaN(Date.parse(endTs))) {
      throw new Error('Invalid endTs format. Must be a valid ISO timestamp.');
    }
    rpcParams.p_end_ts = endTs;
  } else {
    throw new Error('endTs is required');
  }

  // Optional parameters with defaults handled by the SQL function
  if (params.limit !== undefined && params.limit !== null) {
    rpcParams.p_limit = parseInt(String(params.limit), 10);
    if (isNaN(rpcParams.p_limit) || rpcParams.p_limit <= 0) {
      throw new Error('Invalid limit format. Must be a positive number.');
    }
  }

  if (params.minSpins !== undefined && params.minSpins !== null) {
    rpcParams.p_min_spins = parseInt(String(params.minSpins), 10);
    if (isNaN(rpcParams.p_min_spins) || rpcParams.p_min_spins < 0) {
      throw new Error('Invalid minSpins format. Must be a non-negative number.');
    }
  }

  if (params.minVolumeMicro !== undefined && params.minVolumeMicro !== null) {
    rpcParams.p_min_volume_micro = parseInt(String(params.minVolumeMicro), 10);
    if (isNaN(rpcParams.p_min_volume_micro) || rpcParams.p_min_volume_micro < 0) {
      throw new Error('Invalid minVolumeMicro format. Must be a non-negative number.');
    }
  }

  return rpcParams as { 
    p_app_id: number; 
    p_start_ts: string; 
    p_end_ts: string; 
    p_limit?: number; 
    p_min_spins?: number; 
    p_min_volume_micro?: number; 
  };
}

// Handle POST request for Hov tournament data with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();

    // Prepare parameters for RPC call
    const rpcParams = prepareRpcParams(requestParams);

    // Call the RPC function with direct parameters
    const { data, error } = await supabase.rpc('get_hov_tournament', rpcParams);
        
    if (error) {
      console.error('Supabase RPC error (POST /hov/tournaments):', error);
      // Check for specific function-raised errors
      if (error.message.includes('Invalid')) {
         return json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
      throw error; // Re-throw other Supabase errors
    }

    // Return the data directly as the function returns the desired JSON structure
    return json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error fetching Hov tournament data (POST):', error);
    // Handle specific validation errors from prepareRpcParams
     if (error.message.startsWith('Invalid') || error.message.includes('required')) {
        return json({ error: error.message }, { status: 400, headers: corsHeaders });
     }
    // Generic internal server error for other cases
    return json({ error: 'Internal server error' }, {
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for Hov tournament data
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const queryParams = {
      appId: url.searchParams.get('appId'),
      startTs: url.searchParams.get('startTs'),
      endTs: url.searchParams.get('endTs'),
      limit: url.searchParams.get('limit'),
      minSpins: url.searchParams.get('minSpins'),
      minVolumeMicro: url.searchParams.get('minVolumeMicro'),
    };

    // Prepare parameters for RPC call
    const rpcParams = prepareRpcParams(queryParams);

    // Call the RPC function with direct parameters
    const { data, error } = await supabase.rpc('get_hov_tournament', rpcParams);

    if (error) {
      console.error('Supabase RPC error (GET /hov/tournaments):', error);
       // Check for specific function-raised errors
      if (error.message.includes('Invalid')) {
         return json({ error: error.message }, { status: 400, headers: corsHeaders });
      }
      throw error; // Re-throw other Supabase errors
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error fetching Hov tournament data (GET):', error);
     // Handle specific validation errors from prepareRpcParams
     if (error.message.startsWith('Invalid') || error.message.includes('required')) {
        return json({ error: error.message }, { status: 400, headers: corsHeaders });
     }
    // Generic internal server error
    return json({ error: 'Internal server error' }, {
      status: 500,
      headers: corsHeaders
    });
  }
}; 