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

type EventQueryParams = {
  appId?: number;
  who?: string;
  eventType?: string;
  txid?: string;
  roundGte?: number;
  roundLte?: number;
  claimRound?: number;
  isWin?: boolean;
  amountGte?: number;
  amountLte?: number;
  payoutGte?: number;
  payoutLte?: number;
  indexValue?: number;
  maxPaylineIndex?: number;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
  order?: 'asc' | 'desc';
};

function normalizeParams(raw: Record<string, any>): EventQueryParams {
  const toInt = (v: any) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = parseInt(String(v), 10);
    if (Number.isNaN(n)) throw new Error('Invalid number');
    return n;
  };
  const toBool = (v: any) => {
    if (v === undefined || v === null || v === '') return undefined;
    if (typeof v === 'boolean') return v;
    const s = String(v).toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0') return false;
    throw new Error('Invalid boolean');
  };
  const toIso = (v: any) => {
    if (v === undefined || v === null || v === '') return undefined;
    const s = String(v);
    if (isNaN(Date.parse(s))) throw new Error('Invalid timestamp');
    return s;
  };

  const params: EventQueryParams = {
    appId: toInt(raw.appId),
    who: raw.who ?? undefined,
    eventType: raw.eventType ?? undefined,
    txid: raw.txid ?? undefined,
    roundGte: toInt(raw.roundGte ?? raw.round_gte ?? raw.roundMin),
    roundLte: toInt(raw.roundLte ?? raw.round_lte ?? raw.roundMax),
    claimRound: toInt(raw.claimRound ?? raw.claim_round),
    isWin: toBool(raw.isWin ?? raw.is_win),
    amountGte: toInt(raw.amountGte ?? raw.amount_gte),
    amountLte: toInt(raw.amountLte ?? raw.amount_lte),
    payoutGte: toInt(raw.payoutGte ?? raw.payout_gte),
    payoutLte: toInt(raw.payoutLte ?? raw.payout_lte),
    indexValue: toInt(raw.indexValue ?? raw.index_value),
    maxPaylineIndex: toInt(raw.maxPaylineIndex ?? raw.max_payline_index),
    createdAfter: toIso(raw.createdAfter ?? raw.created_after),
    createdBefore: toIso(raw.createdBefore ?? raw.created_before),
    limit: toInt(raw.limit) ?? 100,
    offset: toInt(raw.offset) ?? 0,
    order: (raw.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  };
  if (params.limit && params.limit > 1000) params.limit = 1000;
  if (params.offset && params.offset < 0) params.offset = 0;
  return params;
}

async function queryEvents(params: EventQueryParams) {
  let q = supabase
    .from('hov_events')
    .select('*', { count: 'exact' });

  if (params.appId !== undefined) q = q.eq('app_id', params.appId);
  if (params.who) q = q.eq('who', params.who);
  if (params.eventType) q = q.eq('event_type', params.eventType);
  if (params.txid) q = q.eq('txid', params.txid);
  if (params.roundGte !== undefined) q = q.gte('round', params.roundGte);
  if (params.roundLte !== undefined) q = q.lte('round', params.roundLte);
  if (params.claimRound !== undefined) q = q.eq('claim_round', params.claimRound);
  if (params.isWin !== undefined) q = q.eq('is_win', params.isWin);
  if (params.amountGte !== undefined) q = q.gte('amount', params.amountGte);
  if (params.amountLte !== undefined) q = q.lte('amount', params.amountLte);
  if (params.payoutGte !== undefined) q = q.gte('payout', params.payoutGte);
  if (params.payoutLte !== undefined) q = q.lte('payout', params.payoutLte);
  if (params.indexValue !== undefined) q = q.eq('index_value', params.indexValue);
  if (params.maxPaylineIndex !== undefined) q = q.eq('max_payline_index', params.maxPaylineIndex);
  if (params.createdAfter) q = q.gte('created_at', params.createdAfter);
  if (params.createdBefore) q = q.lte('created_at', params.createdBefore);

  // Order by round then intra for deterministic results
  q = q.order('round', { ascending: params.order !== 'desc' })
       .order('intra', { ascending: params.order !== 'desc' });

  const start = params.offset ?? 0;
  const end = start + ((params.limit ?? 100) - 1);
  q = q.range(start, end);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data, count };
}

async function resolveEnvoiNames(addresses: string[]): Promise<Map<string, { name: string; metadata: any }>> {
  const accountMap = new Map<string, { name: string; metadata: any }>();

  if (addresses.length === 0) return accountMap;

  try {
    const { data, error } = await supabase.rpc('envoi_lookup_names_by_owner', {
      p_addresses: addresses.join(','),
      p_app_id: '45327686'
    });

    if (error) {
      console.error('Error resolving Envoi names:', error);
      return accountMap;
    }

    if (data && Array.isArray(data)) {
      for (const account of data) {
        if (account.address) {
          accountMap.set(account.address, {
            name: account.name,
            metadata: account.metadata
          });
        }
      }
    }
  } catch (error) {
    console.error('Exception resolving Envoi names:', error);
  }

  return accountMap;
}

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json();
    const params = normalizeParams(body ?? {});
    const { data, count } = await queryEvents(params);

    // Extract unique addresses and resolve Envoi names
    const uniqueAddresses = [...new Set((data ?? []).map((row: any) => row.who).filter(Boolean))];
    const accountMap = await resolveEnvoiNames(uniqueAddresses);

    const mapped = (data ?? []).map((row: any) => {
      const algTxid = decodeTxid(row?.txid);
      const accountInfo = row.who ? accountMap.get(row.who) : null;
      return {
        ...row,
        txid: algTxid,
        replayUrl: algTxid ? `https://demo.houseofvoi.com/replay/?tx=${algTxid}` : null,
        ...(accountInfo && {
          envoiName: accountInfo.name,
          envoiMetadata: accountInfo.metadata
        })
      };
    });
    return json({ data: mapped, count, params }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error querying hov_events (POST):', error);
    const msg = typeof error?.message === 'string' ? error.message : 'Internal server error';
    const status = msg.includes('Invalid') ? 400 : 500;
    return json({ error: msg }, { status, headers: corsHeaders });
  }
};

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const raw: Record<string, any> = {};
    url.searchParams.forEach((v, k) => { raw[k] = v; });
    const params = normalizeParams(raw);
    const { data, count } = await queryEvents(params);

    // Extract unique addresses and resolve Envoi names
    const uniqueAddresses = [...new Set((data ?? []).map((row: any) => row.who).filter(Boolean))];
    const accountMap = await resolveEnvoiNames(uniqueAddresses);

    const mapped = (data ?? []).map((row: any) => {
      const algTxid = decodeTxid(row?.txid);
      const accountInfo = row.who ? accountMap.get(row.who) : null;
      return {
        ...row,
        txid: algTxid,
        replayUrl: algTxid ? `https://demo.houseofvoi.com/replay/?tx=${algTxid}` : null,
        ...(accountInfo && {
          envoiName: accountInfo.name,
          envoiMetadata: accountInfo.metadata
        })
      };
    });
    return json({ data: mapped, count, params }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error querying hov_events (GET):', error);
    const msg = typeof error?.message === 'string' ? error.message : 'Internal server error';
    const status = msg.includes('Invalid') ? 400 : 500;
    return json({ error: msg }, { status, headers: corsHeaders });
  }
};

function isHexString(s: any): s is string {
  return typeof s === 'string' && s.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(s);
}

function decodeTxid(txid: any): any {
  try {
    if (!isHexString(txid)) return txid;
    const bytes = Buffer.from(txid, 'hex');
    const ascii = bytes.toString('utf8');
    // Heuristic: Algorand txids are base32 uppercase without padding
    if (/^[A-Z2-7]+$/.test(ascii)) return ascii;
    return txid;
  } catch {
    return txid;
  }
}