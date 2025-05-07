import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import allCurrencies from './currencies.json'; // Import the updated currencies

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const symbols = {
  "USD": "$",
  "EUR": "€",
  "GBP": "£",
  "JPY": "¥",
  "CHF": "₣",
  "CAD": "$",
  "AUD": "$",
  "NZD": "$",
  "INR": "₹",
  "RUB": "₽",
  "BRL": "R$",
  "ARS": "$",
  "CLP": "$",
  "COP": "$",
  "MXN": "$",
  "PEN": "S/",
  "UYU": "$",
  "VEF": "Bs",
  "VND": "₫",
  "ZAR": "R",
  "BTC": "₿",
  "ETH": "Ξ",
  "LTC": "Ł",
  "XTZ": "ꜩ",
  "ADA": "₳",
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Helper function to fetch currency data
async function fetchCurrencyData(currencyCode: string): Promise<any> {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currencyCode.toLowerCase()}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data for ${currencyCode}: ${response.statusText}`);
  }
  return response.json();
}

// Helper function to format numbers without exponential notation
function formatNumber(num: number): string {
  const str = num.toString();
  if (str.includes('e')) {
    const [mantissa, exponent] = str.split('e');
    const exp = parseInt(exponent, 10);
    let result = mantissa.replace('.', '');
    const decimalPos = mantissa.indexOf('.');
    const digitsAfterDecimal = decimalPos === -1 ? 0 : mantissa.length - decimalPos - 1;
    if (exp > 0) {
      result += '0'.repeat(exp - digitsAfterDecimal);
    } else {
      const totalDecimals = Math.abs(exp) + digitsAfterDecimal;
      result = '0.' + '0'.repeat(Math.abs(exp) - 1) + result;
      result = result.slice(0, totalDecimals + 2); // +2 for '0.'
    }
    return result;
  }
  return str;
}

// Handle OPTIONS request for CORS preflight
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: corsHeaders
  });
};

// Handle GET request
export const GET: RequestHandler = async (event) => {
  try {
    const currencyParam = event.params.currency;
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    // Case 1: No currency provided (e.g., from /v1/currencies//)
    if (!currencyParam) {
      const allCurrencyObjects = Object.entries(allCurrencies).map(([id, name]) => {
        let symbol = id.toUpperCase();
        if (id.toLowerCase() === 'usd') {
          symbol = '$';
        }
        else if (id.toLowerCase() === 'eur') {
          symbol = '€';
        }
        return {
          currency_id: id.toUpperCase(),
          name: name || id.toUpperCase(), // Use ID if name from json is empty
          symbol: symbol
        };
      });

      let usdItem: any = null;
      let eurItem: any = null;
      const otherItems: any[] = [];

      for (const item of allCurrencyObjects) {
        if (item.currency_id === 'USD') {
          usdItem = item;
        } else if (item.currency_id === 'EUR') {
          eurItem = item;
        } else {
          otherItems.push(item);
        }
      }

      // Sort other items alphabetically by currency_id
      otherItems.sort((a, b) => a.currency_id.localeCompare(b.currency_id));

      const sortedPrefixedList = [];
      if (usdItem) sortedPrefixedList.push(usdItem);
      if (eurItem) sortedPrefixedList.push(eurItem);
      sortedPrefixedList.push(...otherItems);
      
      const finalListWithTimestamp = sortedPrefixedList.map(item => ({
        ...item,
        generated_at: formattedTimestamp
      }));

      return json(finalListWithTimestamp, { headers: corsHeaders });
    }

    const requestedCurrency = currencyParam.toUpperCase();

    // Check if the requested currency is supported
    if (!(requestedCurrency.toLowerCase() in allCurrencies)) {
      return json({ error: `Currency '${requestedCurrency}' is not supported.` }, { status: 400, headers: corsHeaders });
    }
    
    const tokenAssetId = 390001; // Assuming this is the ARC200 token ID

    // Get current ARC200 token price in USD from Supabase
    const { data: currentTokenUsdPrice, error: currentTokenUsdPriceError } = await supabase
      .rpc('calculate_token_usd_value', {
        p_input_asset_id: tokenAssetId
      });

    if (currentTokenUsdPriceError) {
      console.error('Supabase RPC error (current token USD price):', currentTokenUsdPriceError);
      throw currentTokenUsdPriceError;
    }
    if (currentTokenUsdPrice === null) {
      console.error('Supabase RPC error: current token USD price is null');
      throw new Error('Failed to fetch current token USD price');
    }
    
    // Get ARC200 token price in USD from 24 hours ago from Supabase
    const timestamp24HoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const { data: pastTokenUsdPrice, error: pastTokenUsdPriceError } = await supabase
      .rpc('calculate_token_usd_value', {
        p_input_asset_id: tokenAssetId,
        p_timestamp: timestamp24HoursAgo.toISOString()
      });

    if (pastTokenUsdPriceError) {
      console.error('Supabase RPC error (past token USD price):', pastTokenUsdPriceError);
      // Not throwing, as we can still proceed, but change will be 0 or 100%
    }


    let usdValueForRequestedCurrency = 1;
    let exchangePriceInRequestedCurrency = currentTokenUsdPrice; // Default to USD price
    let last24HoursPriceChangePercentage = 0;

    if (requestedCurrency === 'USD') {
      if (pastTokenUsdPrice !== null && pastTokenUsdPrice !== 0) {
        last24HoursPriceChangePercentage = ((currentTokenUsdPrice - pastTokenUsdPrice) / pastTokenUsdPrice);
      } else if (currentTokenUsdPrice > 0) {
        last24HoursPriceChangePercentage = 1; // 100% change if new and positive
      }
    } else {
      // Requested currency is NOT USD, fetch usd.json for all rates relative to USD
      const apiUsdData = await fetchCurrencyData('usd');
      const ratesFromUsdBase = apiUsdData.usd; // This is an object like {"eur": 0.93, "jpy": 150, ...}
                                           // where key is target currency, value is how much of target currency 1 USD buys.

      const rateOfTargetPerUsd = ratesFromUsdBase[requestedCurrency.toLowerCase()];
      if (typeof rateOfTargetPerUsd !== 'number') {
         return json({ error: `Could not determine rate for ${requestedCurrency} from USD base. Ensure it is a valid currency code.` }, { status: 500, headers: corsHeaders });
      }

      // usdValueForRequestedCurrency: How many USD 1 unit of the requested_currency is worth.
      // e.g., if 1 USD = 0.93 EUR (rateOfTargetPerUsd for EUR is 0.93), then 1 EUR = 1/0.93 USD.
      usdValueForRequestedCurrency = rateOfTargetPerUsd;

      // exchangePriceInRequestedCurrency: ARC200 token's price in the requested_currency.
      // e.g., token_price_in_usd * (EUR_per_USD) = token_price_in_EUR
      exchangePriceInRequestedCurrency = currentTokenUsdPrice * rateOfTargetPerUsd;

      // Calculate 24-hour price change for the token against the requested currency
      // This uses the token's USD price change and converts it using the *current* exchange rate for the target currency as a proxy.
      const currentTokenPriceInTargetCurrency = exchangePriceInRequestedCurrency; // Already calculated

      let pastTokenPriceInTargetCurrency_Approx = 0;
      if (pastTokenUsdPrice !== null) {
        // Convert past token USD price to target currency using *current* exchange rate as proxy
        pastTokenPriceInTargetCurrency_Approx = pastTokenUsdPrice * rateOfTargetPerUsd;
      }

      if (pastTokenPriceInTargetCurrency_Approx !== 0) {
        last24HoursPriceChangePercentage = (currentTokenPriceInTargetCurrency - pastTokenPriceInTargetCurrency_Approx) / pastTokenPriceInTargetCurrency_Approx;
      } else if (currentTokenPriceInTargetCurrency > 0) {
        last24HoursPriceChangePercentage = 1; // 100% change if new and positive, or if past price was zero/unavailable
      }
    }

    const currencyName = allCurrencies[requestedCurrency.toLowerCase() as keyof typeof allCurrencies] || requestedCurrency;
    // Attempt to find a symbol, default to currency code.
    // This part might need a more robust way to get currency symbols if they aren't just the code.
    let currencySymbol = requestedCurrency;
    if (symbols[requestedCurrency as keyof typeof symbols]) {
      currencySymbol = symbols[requestedCurrency as keyof typeof symbols];
    }

    const responseData = {
      generated_at: formattedTimestamp,
      currency_id: requestedCurrency,
      name: currencyName,
      symbol: currencySymbol,
      usd_value: usdValueForRequestedCurrency, // How much 1 unit of this currency is worth in USD
      exchange_price: formatNumber(exchangePriceInRequestedCurrency), // ARC200 token price in this currency
      last_updated_at: formattedTimestamp, // Or API's date if available and preferred
      s: "cb", // Assuming 'cb' stands for 'currency beacon' or similar source
      last_24_hours_price_change_percentage: last24HoursPriceChangePercentage
    };

    return json(responseData, { headers: corsHeaders });
    
  } catch (error: any) {
    console.error('Error fetching currency data:', error);
    return json({ error: error.message || 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}; 