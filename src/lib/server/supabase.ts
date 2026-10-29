import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';

const configuredTimeout = Number(env.UPSTREAM_TIMEOUT_MS);
export const UPSTREAM_TIMEOUT_MS =
	Number.isInteger(configuredTimeout) && configuredTimeout > 0 && configuredTimeout <= 2_147_483_647
		? configuredTimeout
		: 10000;

export class UpstreamError extends Error {
	readonly code: string;

	constructor(
		status: 502 | 504,
		readonly upstreamStatus?: number
	) {
		super(status === 504 ? 'Upstream request timed out' : 'Upstream request failed');
		this.name = 'UpstreamError';
		// PostgREST preserves code when it serializes a rejected fetch into a query error.
		this.code = status === 504 ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_FETCH_FAILED';
	}
}

export const upstreamFetch: typeof fetch = async (input, init) => {
	const timeoutSignal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
	const callerSignal =
		init?.signal === undefined && input instanceof Request ? input.signal : init?.signal;
	const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal;

	function requestError(error: unknown): unknown {
		if (signal.aborted && callerSignal && signal.reason === callerSignal.reason) {
			return callerSignal.reason;
		}
		if (error instanceof UpstreamError) return error;
		return new UpstreamError(timeoutSignal.aborted ? 504 : 502);
	}

	try {
		const response = await globalThis.fetch(input, { ...init, signal });
		if (response.status >= 500) {
			void response.body?.cancel().catch(() => {});
			throw new UpstreamError(
				response.status === 504 || response.status === 524 ? 504 : 502,
				response.status
			);
		}
		if (!response.body) return response;

		// Fetch resolves at headers. Keep the signal context until the body finishes too,
		// since a deadline can surface as AbortError or TypeError: terminated there.
		const reader = response.body.getReader();
		const body = new ReadableStream<Uint8Array>({
			async pull(controller) {
				try {
					const { done, value } = await reader.read();
					if (done) {
						reader.releaseLock();
						controller.close();
					} else {
						controller.enqueue(value);
					}
				} catch (error) {
					reader.releaseLock();
					controller.error(requestError(error));
				}
			},
			async cancel(reason) {
				await reader.cancel(reason);
				reader.releaseLock();
			}
		});
		return new Response(body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers
		});
	} catch (error) {
		throw requestError(error);
	}
};

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	global: { fetch: upstreamFetch }
});

export function upstreamErrorResponse(error: unknown, headers?: HeadersInit): Response | undefined {
	if (!error || typeof error !== 'object') return;
	const { code, name, message } = error as { code?: unknown; name?: unknown; message?: unknown };
	// Body reads can reject after fetch resolves; recognize native and serialized errors too.
	const timeout =
		code === 'UPSTREAM_TIMEOUT' ||
		name === 'TimeoutError' ||
		(typeof message === 'string' && message.startsWith('TimeoutError:'));
	const failed =
		code === 'UPSTREAM_FETCH_FAILED' ||
		(name === 'TypeError' && message === 'terminated') ||
		message === 'TypeError: terminated';
	if (!timeout && !failed) return;
	return json(
		{ error: timeout ? 'Upstream request timed out' : 'Upstream request failed' },
		{
			status: timeout ? 504 : 502,
			headers
		}
	);
}
