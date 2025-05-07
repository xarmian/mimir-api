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

// Handle GET request for ARC200 balances
export const GET: RequestHandler = async (event) => {
  try {
    const currency = event.params.currency;

    // Case 1: No currency provided (currency string is empty e.g. from /v1/currencies//)
    if (!currency) {
      const now = new Date();
      const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
      const supportedCurrencies = [
        {
          generated_at: formattedTimestamp,
          currency_id: "USD",
          name: "US Dollar",
          symbol: "$"
        }
      ];
      return json(supportedCurrencies, { headers: corsHeaders });
    }

    // Case 2: Currency is USD
    if (currency.toUpperCase() === 'USD') {
      // Call the RPC function with the p_input_asset_id parameter
      const { data: exchangePrice, error: rpcError } = await supabase
        .rpc('calculate_token_usd_value', {
          p_input_asset_id: 390001
        });

      if (rpcError) {
        console.error('Supabase RPC error:', rpcError);
        throw rpcError;
      }

      const now = new Date();
      const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

      const responseData = {
        generated_at: formattedTimestamp,
        currency_id: "USD",
        name: "US Dollar",
        symbol: "$",
        usd_value: 1,
        exchange_price: exchangePrice,
        last_updated_at: formattedTimestamp,
        s: "cb",
        last_24_hours_price_change_percentage: 0 // Preserving user's update
      };

      return json(responseData, { headers: corsHeaders });
    }
    
    // Case 3: Currency provided, but not empty and not USD (unsupported)
    return json({ error: `Currency '${currency}' is not supported. Only USD is supported.` }, { status: 400, headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 