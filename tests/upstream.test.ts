import { afterEach, describe, expect, it, vi } from 'vitest';
import { upstreamFetch, upstreamErrorResponse } from '../src/lib/server/supabase';
import { createClient } from '@supabase/supabase-js';

const privateEnv = vi.hoisted(() => ({ UPSTREAM_TIMEOUT_MS: '30' as string | undefined }));
vi.mock('$env/dynamic/private', () => ({ env: privateEnv }));
vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://upstream.invalid',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));

afterEach(() => {
	vi.unstubAllGlobals();
});

function hangUntilAborted(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	return new Promise((_resolve, reject) => {
		const signal = init?.signal;
		if (signal?.aborted) reject(signal.reason);
		else signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
	});
}

describe('upstreamFetch', () => {
	it('defaults to 10000 ms when the override is absent or invalid', async () => {
		try {
			for (const value of [undefined, '0', 'invalid']) {
				privateEnv.UPSTREAM_TIMEOUT_MS = value;
				vi.resetModules();
				const { UPSTREAM_TIMEOUT_MS } = await import('../src/lib/server/supabase');
				expect(UPSTREAM_TIMEOUT_MS).toBe(10000);
			}
		} finally {
			privateEnv.UPSTREAM_TIMEOUT_MS = '30';
		}
	});

	it('aborts a hung fetch after the configured timeout', async () => {
		const fetchMock = vi.fn(hangUntilAborted);
		vi.stubGlobal('fetch', fetchMock);
		const result = upstreamFetch('https://upstream.invalid').catch((error: unknown) => error);

		// Native AbortSignal.timeout uses real timers. Bound the test even if the wrapper is removed.
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
		const response = upstreamErrorResponse(await result);
		expect(response?.status).toBe(504);
		expect(await response?.json()).toEqual({ error: 'Upstream request timed out' });
	});

	it('passes through successful responses and request options', async () => {
		const response = new Response('{"ok":true}', {
			status: 201,
			statusText: 'Created',
			headers: { 'X-Upstream': 'value' }
		});
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
		vi.stubGlobal('fetch', fetchMock);
		const init = { method: 'POST', headers: { 'X-Test': 'value' }, body: '{}' };

		const result = await upstreamFetch('https://upstream.invalid', init);
		expect(result.status).toBe(201);
		expect(result.statusText).toBe('Created');
		expect(result.headers.get('X-Upstream')).toBe('value');
		expect(await result.json()).toEqual({ ok: true });
		expect(fetchMock).toHaveBeenCalledWith('https://upstream.invalid', {
			...init,
			signal: expect.any(AbortSignal)
		});
	});

	it.each(['options', 'request'] as const)(
		'respects a caller abort supplied through %s',
		async (source) => {
			vi.stubGlobal('fetch', vi.fn(hangUntilAborted));
			const controller = new AbortController();
			const reason = new Error('Caller cancelled');
			const input =
				source === 'request'
					? new Request('https://upstream.invalid', { signal: controller.signal })
					: 'https://upstream.invalid';
			const result = upstreamFetch(
				input,
				source === 'options' ? { signal: controller.signal } : undefined
			);
			controller.abort(reason);
			await expect(result).rejects.toBe(reason);
		}
	);

	it.each(['AbortError', 'TimeoutError', 'terminated'])(
		'maps a stalled body rejecting with %s to 504',
		async (failure) => {
			vi.stubGlobal(
				'fetch',
				vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
					const body = new ReadableStream({
						start(controller) {
							init?.signal?.addEventListener(
								'abort',
								() => {
									controller.error(
										failure === 'terminated'
											? new TypeError('terminated')
											: new DOMException('Body read aborted', failure)
									);
								},
								{ once: true }
							);
						}
					});
					return new Response(body);
				})
			);
			const response = await upstreamFetch('https://upstream.invalid');
			const error = await response.json().catch((error: unknown) => error);
			expect(upstreamErrorResponse(error)?.status).toBe(504);
		}
	);

	it('preserves caller cancellation during a body read even after the deadline passes', async () => {
		const caller = new AbortController();
		vi.stubGlobal(
			'fetch',
			vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
				return new Response(
					new ReadableStream({
						start(controller) {
							init?.signal?.addEventListener(
								'abort',
								() => {
									controller.error(new DOMException('Body read aborted', 'AbortError'));
								},
								{ once: true }
							);
						}
					})
				);
			})
		);
		const response = await upstreamFetch('https://upstream.invalid', { signal: caller.signal });
		caller.abort();
		await new Promise((resolve) => setTimeout(resolve, 60));
		const error = await response.json().catch((error: unknown) => error);
		expect(error).toBe(caller.signal.reason);
		expect(upstreamErrorResponse(error)).toBeUndefined();
	});

	it.each([520, 524, 525])('maps upstream HTTP %i to a short gateway error', async (status) => {
		vi.stubGlobal(
			'fetch',
			vi.fn<typeof fetch>().mockResolvedValue(new Response('Cloudflare error', { status }))
		);
		const error = await upstreamFetch('https://upstream.invalid').catch((error: unknown) => error);
		const response = upstreamErrorResponse(error, { 'Access-Control-Allow-Origin': '*' });
		expect(response?.status).toBe(status === 524 ? 504 : 502);
		expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it.each(['timeout', 'network'] as const)(
		'preserves %s classification through Supabase serialization',
		async (failure) => {
			vi.stubGlobal(
				'fetch',
				failure === 'timeout'
					? vi.fn(hangUntilAborted)
					: vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'))
			);
			const client = createClient('https://upstream.invalid', 'test-anon-key', {
				global: { fetch: upstreamFetch }
			});
			const { error } = await client.rpc('test_rpc');
			const response = upstreamErrorResponse(error);
			expect(response?.status).toBe(failure === 'timeout' ? 504 : 502);
			expect(await response?.json()).toEqual({
				error: failure === 'timeout' ? 'Upstream request timed out' : 'Upstream request failed'
			});
		}
	);

	it('leaves ordinary query and validation errors to existing route handling', () => {
		expect(upstreamErrorResponse({ code: '22023', message: 'Invalid parameters' })).toBeUndefined();
		expect(upstreamErrorResponse(new SyntaxError('Invalid JSON'))).toBeUndefined();
	});
});
