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

// Handle POST request for ARC72 transfers with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    
    // Call the RPC function with a single JSON parameter
    const { data, error } = await supabase
      .rpc('get_arc72_transfers', {
        params: requestParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC72 transfers:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC72 transfers
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const contractId = url.searchParams.get('contractId');
    const tokenId = url.searchParams.get('tokenId');
    const user = url.searchParams.get('user');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const round = url.searchParams.get('round');
    const minRound = url.searchParams.get('min-round');
    const maxRound = url.searchParams.get('max-round');
    const limit = url.searchParams.get('limit');
    const nextToken = url.searchParams.get('next-token');
    const minTimestamp = url.searchParams.get('min-time');
    const maxTimestamp = url.searchParams.get('max-time');

    // Create parameters object for RPC call
    const queryParams: Record<string, any> = {};
    
    if (contractId) queryParams.contractId = contractId;
    if (tokenId) queryParams.tokenId = tokenId;
    if (user) queryParams.user = user;
    if (from) queryParams.from = from;
    if (to) queryParams.to = to;
    if (round) queryParams.round = round;
    if (minRound) queryParams['min-round'] = minRound;
    if (maxRound) queryParams['max-round'] = maxRound;
    if (limit) queryParams.limit = parseInt(limit);
    if (nextToken) queryParams['next-token'] = nextToken;
    if (minTimestamp) queryParams['min-time'] = minTimestamp;
    if (maxTimestamp) queryParams['max-time'] = maxTimestamp;

    // Call the RPC function with the params parameter
    const { data, error } = await supabase
      .rpc('get_arc72_transfers', {
        params: queryParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC72 transfers:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 