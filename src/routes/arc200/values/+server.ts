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

// Helper function to convert token IDs to CSV string
function tokenIdsToCsv(tokenIds: string | string[] | number[]): string {
  if (typeof tokenIds === 'string') {
    return tokenIds;
  }
  if (Array.isArray(tokenIds)) {
    return tokenIds.map(id => String(id)).join(',');
  }
  return String(tokenIds);
}

// Helper function to transform RPC response to JSON object
function transformResponse(data: Array<{ token_id: number; usd_value: number | null }>): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  if (Array.isArray(data)) {
    for (const row of data) {
      result[String(row.token_id)] = row.usd_value;
    }
  }
  return result;
}

// Handle POST request for ARC200 token values with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    
    // Extract tokenIds and timestamp
    const { tokenIds, timestamp } = requestParams;
    
    // Validate tokenIds
    if (!tokenIds || (typeof tokenIds === 'string' && tokenIds.trim() === '') || (Array.isArray(tokenIds) && tokenIds.length === 0)) {
      return json({ error: 'tokenIds is required and must be a non-empty string or array' }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Convert tokenIds to CSV string
    const csvTokenIds = tokenIdsToCsv(tokenIds);
    
    // Prepare RPC parameters
    const rpcParams: { p_token_ids: string; p_timestamp?: string } = {
      p_token_ids: csvTokenIds
    };
    
    // Add timestamp if provided
    if (timestamp) {
      rpcParams.p_timestamp = timestamp;
    }
    
    // Call the RPC function
    const { data, error } = await supabase
      .rpc('calculate_token_usd_values', rpcParams);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Transform response to JSON object
    const transformedData = transformResponse(data || []);
    
    // Return the transformed data
    return json(transformedData, { headers: corsHeaders });
    
  } catch (error: any) {
    console.error('Error fetching ARC200 token values:', error);
    
    // Handle validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      return json({ error: error.message }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC200 token values
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const tokenIds = url.searchParams.get('tokenIds');
    const timestamp = url.searchParams.get('timestamp');
    
    // Validate tokenIds
    if (!tokenIds || tokenIds.trim() === '') {
      return json({ error: 'tokenIds query parameter is required and must be a non-empty string' }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Prepare RPC parameters
    const rpcParams: { p_token_ids: string; p_timestamp?: string } = {
      p_token_ids: tokenIds.trim()
    };
    
    // Add timestamp if provided
    if (timestamp) {
      rpcParams.p_timestamp = timestamp.trim();
    }
    
    // Call the RPC function
    const { data, error } = await supabase
      .rpc('calculate_token_usd_values', rpcParams);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Transform response to JSON object
    const transformedData = transformResponse(data || []);
    
    // Return the transformed data
    return json(transformedData, { headers: corsHeaders });
    
  } catch (error: any) {
    console.error('Error fetching ARC200 token values:', error);
    
    // Handle validation errors
    if (error.message && (error.message.includes('required') || error.message.includes('Invalid'))) {
      return json({ error: error.message }, { 
        status: 400,
        headers: corsHeaders
      });
    }
    
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

