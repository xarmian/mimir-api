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

    if (!currency || currency.toUpperCase() !== 'USD') {
      return json({ error: 'Invalid currency. Only USD is supported.' }, { status: 400, headers: corsHeaders });
    }

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
      exchange_price: exchangePrice, // Assuming the RPC returns the numeric value directly
      last_updated_at: formattedTimestamp, // Using current time, adjust if different source
      s: "cb", // As per example
      last_24_hours_price_change_percentage: 0 // As per example
    };

    // Return the data directly
    return json(responseData, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching currency data:', error);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 