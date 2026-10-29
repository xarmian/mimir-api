import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabase, upstreamErrorResponse } from '$lib/server/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// TASK-282: this endpoint reads the trigger-maintained public.arc200_balances
// table via get_arc200_balances, instead of recomputing balances from
// arc200_transfers at query time via get_arc200_account_state. Measured on
// production: contractId query 426ms -> 3ms, contractId+accountId 58ms -> 1.3ms.
// The cached table was verified complete (zero mismatches vs a fresh aggregate
// across the 5 highest-activity contracts, 87,526 rows).
const BALANCES_RPC = 'get_arc200_balances';

// get_arc200_balances is wider than the old get_arc200_account_state: it accepts
// symbol/verified ALONE, whereas the old RPC required address or contractId. A
// symbol/verified-only query runs a ~220ms scan of ~93k rows to compute
// total-count, and this endpoint is anon-callable -- an availability risk we do
// not want to open. So preserve the endpoint's existing input contract: require
// at least one account or contract identifier. symbol/verified still work as
// ADDITIONAL filters alongside a contractId; only symbol/verified-ALONE is
// rejected -- which already failed (as a 500) under the old RPC, so no legitimate
// consumer is affected.
function hasRequiredIdentifier(p: Record<string, unknown>): boolean {
  const nonEmpty = (v: unknown) =>
    v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '');
  return nonEmpty(p.accountId) || nonEmpty(p.accountIds) || nonEmpty(p.contractId);
}

// Handle OPTIONS request for CORS preflight
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: corsHeaders
  });
};

// Handle POST request for ARC200 balances with JSON body
export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    // Get parameters from request body. The RPC accepts accountIds (JSON array
    // or comma-separated string) in addition to the scalar accountId (TASK-281),
    // and POST forwards the body verbatim, so no per-field mapping is needed.
    const requestParams = await request.json();

    if (!hasRequiredIdentifier(requestParams)) {
      return json(
        { error: 'One of accountId, accountIds, or contractId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Call the RPC function with a single JSON parameter
    const { data, error } = await supabase
      .rpc(BALANCES_RPC, {
        params: requestParams
      });

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

// Handle GET request for ARC200 balances
export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    // Get query parameters
    const contractId = url.searchParams.get('contractId');
    const accountId = url.searchParams.get('accountId');
    // TASK-281/282: comma-separated list of accounts, e.g. ?accountIds=ADDR1,ADDR2.
    // Passed through as a string; the RPC parses the CSV.
    const accountIds = url.searchParams.get('accountIds');
    const symbol = url.searchParams.get('symbol');
    const verified = url.searchParams.get('verified');
    const limit = url.searchParams.get('limit');
    const nextToken = url.searchParams.get('next-token');

    // Create parameters object for RPC call
    const queryParams: Record<string, unknown> = {};

    if (contractId) queryParams.contractId = parseInt(contractId);
    if (accountId) queryParams.accountId = accountId;
    if (accountIds) queryParams.accountIds = accountIds;
    if (symbol) queryParams.symbol = symbol;
    if (verified !== null) queryParams.verified = parseInt(verified);
    if (limit) queryParams.limit = parseInt(limit);
    if (nextToken) queryParams['next-token'] = nextToken;

    if (!hasRequiredIdentifier(queryParams)) {
      return json(
        { error: 'One of accountId, accountIds, or contractId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Call the RPC function with the params parameter
    const { data, error } = await supabase
      .rpc(BALANCES_RPC, {
        params: queryParams
      });

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