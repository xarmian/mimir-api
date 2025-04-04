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

// Format the raw transfers data to the desired response format
function formatTransfersResponse(data: any[], offset: number, limit: number) {
  // Map the raw transfers to the desired format
  const transfers = data.map(transfer => ({
    transactionId: transfer.transactionid,
    contractId: parseInt(transfer.contractid),
    timestamp: transfer.timestamp,
    round: transfer.round,
    sender: transfer.from,
    receiver: transfer.to,
    amount: transfer.amount
  }));

  // Calculate the next-token for pagination
  // If we have exactly the number of items requested, there might be more
  const nextToken = transfers.length === limit && transfers.length > 0 
    ? transfers[transfers.length - 1].round + 1
    : undefined;

  // Construct the response object
  const response: any = {
    transfers
  };

  // Only add next-token if it exists
  if (nextToken) {
    response['next-token'] = nextToken;
  }

  return response;
}

// Handle POST request for ARC200 transfers with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body
    const requestParams = await request.json();
    const limit = requestParams.limit || 100;
    const offset = requestParams.offset || 0;
    
    // Call the RPC function with parameters passed directly with correct case
    const { data, error } = await supabase.rpc('get_arc200_transfers', {
      p_round: requestParams.round || null,
      p_limit: limit,
      p_offset: offset,
      p_contractid: requestParams.contractId || null, // Note: lowercase 'id'
      p_user: requestParams.user || null,
      p_from: requestParams.from || null,
      p_to: requestParams.to || null,
      p_min_round: requestParams.min_round || null,
      p_max_round: requestParams.max_round || null,
      p_includes: requestParams.includes || null
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Format the response
    const formattedResponse = formatTransfersResponse(data, offset, limit);
    
    // Return the formatted data
    return json(formattedResponse, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC200 transfers:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};

// Handle GET request for ARC200 transfers
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const round = url.searchParams.get('round');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const contractId = url.searchParams.get('contractId');
    const user = url.searchParams.get('user');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const minRound = url.searchParams.get('min_round');
    const maxRound = url.searchParams.get('max_round');
    const includes = url.searchParams.get('includes');

    // Call the RPC function with parameters directly with correct case
    const { data, error } = await supabase.rpc('get_arc200_transfers', {
      p_round: round ? parseInt(round) : null,
      p_limit: limit,
      p_offset: offset,
      p_contractid: contractId ? parseInt(contractId) : null, // Note: lowercase 'id'
      p_user: user || null,
      p_from: from || null,
      p_to: to || null,
      p_min_round: minRound ? parseInt(minRound) : null,
      p_max_round: maxRound ? parseInt(maxRound) : null,
      p_includes: includes || null
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }
    
    // Format the response
    const formattedResponse = formatTransfersResponse(data, offset, limit);
    
    // Return the formatted data
    return json(formattedResponse, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching ARC200 transfers:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
};
