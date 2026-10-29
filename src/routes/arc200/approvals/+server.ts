import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase, upstreamErrorResponse } from '$lib/server/supabase';

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

// Handle POST request for ARC200 approvals with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    
    // Call the RPC function with a single JSON parameter
    const { data, error } = await supabase
      .rpc('get_arc200_approvals', {
        params: requestParams
      }).abortSignal(request.signal);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC200 balances:', error);
    const upstreamResponse = upstreamErrorResponse(error, corsHeaders);
    if (upstreamResponse) return upstreamResponse;
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC200 approvals
export const GET: RequestHandler = async ({ url, request }) => {
  try {
    // Get query parameters
    const contractId = url.searchParams.get('contractId');
    const owner = url.searchParams.get('owner');
    const spender = url.searchParams.get('spender');
    const limit = url.searchParams.get('limit');
    const nextToken = url.searchParams.get('next-token');

    // Create parameters object for RPC call
    const queryParams: Record<string, any> = {};
    
    if (contractId) queryParams.contractId = parseInt(contractId);
    if (owner) queryParams.owner = owner;
    if (spender) queryParams.spender = spender;
    if (limit) queryParams.limit = parseInt(limit);
    if (nextToken) queryParams['next-token'] = nextToken;

    // Call the RPC function with the params parameter
    const { data, error } = await supabase
      .rpc('get_arc200_approvals', {
        params: queryParams
      }).abortSignal(request.signal);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Return the data directly
    return json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC200 approvals:', error);
    const upstreamResponse = upstreamErrorResponse(error, corsHeaders);
    if (upstreamResponse) return upstreamResponse;
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 