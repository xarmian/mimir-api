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
      const now = new Date();
      const timestamp24HoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      // Get current exchange price
      const { data: currentExchangePrice, error: currentPriceError } = await supabase
        .rpc('calculate_token_usd_value', {
          p_input_asset_id: 390001
        });

      if (currentPriceError) {
        console.error('Supabase RPC error (current price):', currentPriceError);
        throw currentPriceError;
      }

      // Get exchange price from 24 hours ago
      const { data: pastExchangePrice, error: pastPriceError } = await supabase
        .rpc('calculate_token_usd_value', {
          p_input_asset_id: 390001,
          p_timestamp: timestamp24HoursAgo.toISOString()
        });

      if (pastPriceError) {
        console.error('Supabase RPC error (past price):', pastPriceError);
        // Decide if you want to throw or handle this differently, e.g., return 0% change
        throw pastPriceError; 
      }

      let last24HoursPriceChangePercentage = 0;
      if (pastExchangePrice !== null && pastExchangePrice !== 0) {
        last24HoursPriceChangePercentage = ((currentExchangePrice - pastExchangePrice) / pastExchangePrice);
      } else if (currentExchangePrice > 0) {
         last24HoursPriceChangePercentage = currentExchangePrice > 0 ? 1 : 0; // Simplified: 100% if new and positive, else 0
      }

      const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

      const responseData = {
        generated_at: formattedTimestamp,
        currency_id: "USD",
        name: "US Dollar",
        symbol: "$",
        usd_value: 1,
        exchange_price: currentExchangePrice,
        last_updated_at: formattedTimestamp,
        s: "cb",
        last_24_hours_price_change_percentage: last24HoursPriceChangePercentage
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