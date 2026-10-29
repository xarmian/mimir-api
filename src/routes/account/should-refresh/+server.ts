import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase, upstreamErrorResponse } from '$lib/server/supabase';

// TODO: Consider if CORS headers are needed here, similar to other endpoints.
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type'
// };

// export const OPTIONS: RequestHandler = async () => {
//   return new Response(null, {
//     headers: corsHeaders
//   });
// };

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { account_addresses, last_known_round } = body;

    if (!Array.isArray(account_addresses) || account_addresses.some(addr => typeof addr !== 'string')) {
      return json({ error: 'Invalid account_addresses: Must be an array of strings.' }, { status: 400 });
    }

    if (typeof last_known_round !== 'number') {
      return json({ error: 'Invalid last_known_round: Must be a number.' }, { status: 400 });
    }

    const { data: rpcResponse, error: rpcError } = await supabase
      .rpc('should_refresh', {
        p_account_addresses: account_addresses,
        p_round_number: last_known_round
      });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return upstreamErrorResponse(rpcError) ?? json({ error: 'RPC error occurred' }, { status: 500 });
    }
    
    const refresh = typeof rpcResponse === 'boolean' ? rpcResponse : rpcResponse?.result;

    if (typeof refresh !== 'boolean') {
        console.error('Unexpected RPC response format:', rpcResponse);
        return json({ error: 'Unexpected RPC response format from should_refresh'}, {status: 500 });
    }

    return json({ refresh });
  } catch (error) {
    console.error('Error processing should-refresh request:', error);
    const upstreamResponse = upstreamErrorResponse(error);
    if (upstreamResponse) return upstreamResponse;
    if (error instanceof SyntaxError) {
      return json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return json({ error: 'An unexpected error occurred processing your request.' }, { status: 500 });
  }
};
