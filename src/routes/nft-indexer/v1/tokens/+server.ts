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

// Handle POST request for ARC72 tokens with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    
    // Call the RPC function with a single JSON parameter
    const { data, error } = await supabase
      .rpc('get_arc72_tokens', {
        params: requestParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC200 tokens:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC72 tokens
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const contractId = url.searchParams.get('contractId');
    const tokenId = url.searchParams.get('tokenId');
    const owner = url.searchParams.get('owner');
    const tokenIds = url.searchParams.get('tokenIds');
    const approved = url.searchParams.get('approved');
    const round = url.searchParams.get('round');
    const isBurned = url.searchParams.get('isBurned');
    const limit = url.searchParams.get('limit');
    const nextToken = url.searchParams.get('next-token');
    const metadataSearch = url.searchParams.get('metadataSearch');

    // Create parameters object for RPC call
    const queryParams: Record<string, any> = {};
    
    if (contractId) queryParams.contractId = contractId;
    if (tokenId) queryParams.tokenId = tokenId;
    if (owner) queryParams.owner = owner;
    if (tokenIds) queryParams.tokenIds = tokenIds;
    if (approved) queryParams.approved = approved;
    if (round) queryParams.round = round;
    if (isBurned) queryParams.isBurned = isBurned;
    if (limit) queryParams.limit = parseInt(limit);
    if (nextToken) queryParams['next-token'] = nextToken;
    
    // Handle metadata search in two ways:
    // 1. Simple string search with metadataSearch parameter
    if (metadataSearch) {
      try {
        // Check if it's a JSON string that can be parsed
        const parsedMetadata = JSON.parse(metadataSearch);
        queryParams.metadataSearch = parsedMetadata;
      } catch (e) {
        // If not valid JSON, use as a simple string search
        queryParams.metadataSearch = metadataSearch;
      }
    }
    
    // 2. Multiple key-value pairs from URL parameters
    // Find all parameters that start with "metadata."
    const metadataParams: Record<string, string> = {};
    let hasMetadataParams = false;
    
    for (const [key, value] of url.searchParams.entries()) {
      if (key.startsWith('metadata.') && value) {
        const metadataKey = key.substring('metadata.'.length);
        metadataParams[metadataKey] = value;
        hasMetadataParams = true;
      }
    }
    
    // Only set metadataSearch from URL parameters if we have some
    // and the metadataSearch parameter wasn't explicitly provided
    if (hasMetadataParams && !metadataSearch) {
      queryParams.metadataSearch = metadataParams;
    }

    // Call the RPC function with the params parameter
    const { data, error } = await supabase
      .rpc('arc72_get_tokens', {
        params: queryParams
      });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC72 tokens:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 