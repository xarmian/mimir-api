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

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    const wallet_address = url.searchParams.get('accountId');

    if (!wallet_address || wallet_address.trim() === '') {
      return json({ error: 'Missing or invalid address parameter: Must be a non-empty string.' }, { status: 400 });
    }

    const { data: rpcResponse, error: rpcError } = await supabase
      .rpc('get_account_by_wallet', {
        wallet_address: wallet_address
      }).abortSignal(request.signal);

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return upstreamErrorResponse(rpcError) ?? json({ error: 'RPC error occurred' }, { status: 500 });
    }

    if (!rpcResponse || !Array.isArray(rpcResponse)) {
      console.error('Unexpected RPC response format:', rpcResponse);
      return json({ error: 'Unexpected RPC response format from get_account_by_wallet' }, { status: 500 });
    }

    // Return the first account record if found, or null if no account exists
    const accountInfo = rpcResponse.length > 0 ? rpcResponse[0] : null;

    return json({ account: accountInfo });
  } catch (error) {
    console.error('Error processing account info request:', error);
    const upstreamResponse = upstreamErrorResponse(error);
    if (upstreamResponse) return upstreamResponse;
    return json({ error: 'An unexpected error occurred processing your request.' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { accountId: wallet_address } = body;

    if (typeof wallet_address !== 'string' || wallet_address.trim() === '') {
      return json({ error: 'Invalid wallet_address: Must be a non-empty string.' }, { status: 400 });
    }

    const { data: rpcResponse, error: rpcError } = await supabase
      .rpc('get_account_by_wallet', {
        wallet_address: wallet_address
      }).abortSignal(request.signal);

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return upstreamErrorResponse(rpcError) ?? json({ error: 'RPC error occurred' }, { status: 500 });
    }

    if (!rpcResponse || !Array.isArray(rpcResponse)) {
      console.error('Unexpected RPC response format:', rpcResponse);
      return json({ error: 'Unexpected RPC response format from get_account_by_wallet' }, { status: 500 });
    }

    // Return the first account record if found, or null if no account exists
    const accountInfo = rpcResponse.length > 0 ? rpcResponse[0] : null;

    return json({ account: accountInfo });
  } catch (error) {
    console.error('Error processing account info request:', error);
    const upstreamResponse = upstreamErrorResponse(error);
    if (upstreamResponse) return upstreamResponse;
    if (error instanceof SyntaxError) {
      return json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }
    return json({ error: 'An unexpected error occurred processing your request.' }, { status: 500 });
  }
};
