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

// Handle POST request for marketplace deletes with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    
    // Call the RPC function with a single JSON parameter
    const { data, error } = await supabase
      .rpc('mp_get_deletes', {
        params: requestParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching marketplace deletes:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for marketplace deletes
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const mpContractId = url.searchParams.get('mpContractId');
    const mpListingId = url.searchParams.get('mpListingId');
    const collectionId = url.searchParams.get('collectionId');
    const tokenId = url.searchParams.get('tokenId');
    const owner = url.searchParams.get('owner');
    const minRound = url.searchParams.get('min-round');
    const maxRound = url.searchParams.get('max-round');
    const minTime = url.searchParams.get('min-time');
    const maxTime = url.searchParams.get('max-time');
    const sort = url.searchParams.get('sort');
    const next = url.searchParams.get('next-token');
    const limit = url.searchParams.get('limit');

    // Create parameters object for RPC call
    const queryParams: Record<string, any> = {};
    
    if (mpContractId) queryParams.mpContractId = parseInt(mpContractId);
    if (mpListingId) queryParams.mpListingId = mpListingId;
    if (collectionId) queryParams.collectionId = collectionId;
    if (tokenId) queryParams.tokenId = tokenId;
    if (owner) queryParams.owner = owner;
    if (minRound) queryParams['min-round'] = parseInt(minRound);
    if (maxRound) queryParams['max-round'] = parseInt(maxRound);
    if (minTime) queryParams['min-time'] = parseInt(minTime);
    if (maxTime) queryParams['max-time'] = parseInt(maxTime);
    if (sort) queryParams.sort = sort;
    if (next) queryParams.next = next;
    if (limit) queryParams.limit = parseInt(limit);

    // Call the RPC function with the params parameter
    const { data, error } = await supabase
      .rpc('mp_get_deletes', {
        params: queryParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching marketplace deletes:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};
