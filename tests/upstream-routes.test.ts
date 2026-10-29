import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://upstream.invalid',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: { UPSTREAM_TIMEOUT_MS: '10' } }));

const modules = import.meta.glob<{ GET?: RequestHandler; POST?: RequestHandler }>(
	'../src/routes/**/+server.ts',
	{ eager: true }
);
const routes = Object.entries(modules).filter(([path]) => !path.includes('/tournament/'));
const params = {
	accountId: 'test-address',
	account_addresses: ['test-address'],
	last_known_round: 1,
	appId: 1,
	address: 'test-address',
	tokenIds: ['1'],
	startTs: '2026-10-28T00:00:00Z',
	endTs: '2026-10-29T00:00:00Z'
};

beforeEach(() => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function event(method: string, signal?: AbortSignal): RequestEvent {
	const url = new URL('https://app.invalid');
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
	const fixture: Pick<RequestEvent, 'url' | 'params' | 'request'> = {
		url,
		params: { currency: 'EUR' },
		request: new Request(url, {
			method,
			signal,
			...(method === 'POST' ? { body: JSON.stringify(params) } : {})
		})
	};
	return fixture as RequestEvent;
}

describe.each(['timeout', 'network'] as const)('%s failures', (failure) => {
	it.each(routes)(
		'%s returns a gateway JSON error from every handler',
		async (_path, route) => {
			vi.stubGlobal(
				'fetch',
				vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
					if (failure === 'network') throw new TypeError('fetch failed');
					return new Promise((_resolve, reject) => {
						init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
							once: true
						});
					});
				})
			);
			for (const method of ['GET', 'POST'] as const) {
				const handler = route[method];
				if (!handler) continue;
				const response = await handler(event(method));
				expect(response.status).toBe(failure === 'timeout' ? 504 : 502);
				expect(await response.json()).toEqual({
					error: failure === 'timeout' ? 'Upstream request timed out' : 'Upstream request failed'
				});
			}
		},
		1000
	);
});

it.each(['currency fetch', 'past price', 'name lookup'])(
	'propagates transport failure from the secondary %s',
	async (step) => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn<typeof fetch>()
				.mockResolvedValueOnce(
					new Response(step === 'name lookup' ? '[{"who":"test-address"}]' : '1')
				)
				.mockImplementationOnce(async () => {
					if (step !== 'currency fetch') throw new TypeError('fetch failed');
					return new Response('1');
				})
				.mockImplementation(async () => {
					if (step === 'currency fetch') throw new TypeError('fetch failed');
					return new Response('{"usd":{"eur":1}}');
				})
		);
		const path =
			step === 'name lookup'
				? '../src/routes/hov/events/+server.ts'
				: '../src/routes/v1/currencies/[...currency]/+server.ts';
		const response = await modules[path].GET!(event('GET'));
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ error: 'Upstream request failed' });
	}
);

it.each(routes)('%s forwards caller cancellation from every handler', async (_path, route) => {
	for (const method of ['GET', 'POST'] as const) {
		const handler = route[method];
		if (!handler) continue;
		const caller = new AbortController();
		const reason = new DOMException('Client disconnected', 'AbortError');
		const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
			caller.abort(reason);
			return new Promise((_resolve, reject) => {
				const signal = init?.signal;
				if (signal?.aborted) reject(signal.reason);
				else signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
			});
		});
		vi.stubGlobal('fetch', fetchMock);
		const response = await handler(event(method, caller.signal));
		expect(fetchMock).toHaveBeenCalled();
		expect(fetchMock.mock.calls[0][1]?.signal?.reason).toBe(reason);
		expect(response.status).not.toBe(504);
	}
});

it.each(['past price', 'currency fetch', 'name lookup'])(
	'forwards caller cancellation to the secondary %s',
	async (step) => {
		const caller = new AbortController();
		const reason = new DOMException('Client disconnected', 'AbortError');
		const observed: (AbortSignal | null | undefined)[] = [];
		const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
			observed.push(init?.signal);
			const targetCall = step === 'currency fetch' ? 3 : 2;
			if (observed.length < targetCall) {
				return new Response(step === 'name lookup' ? '[{"who":"test-address"}]' : '1');
			}
			caller.abort(reason);
			return new Promise((_resolve, reject) => {
				const signal = init?.signal;
				if (signal?.aborted) reject(signal.reason);
				else signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
			});
		});
		vi.stubGlobal('fetch', fetchMock);
		const path =
			step === 'name lookup'
				? '../src/routes/hov/events/+server.ts'
				: '../src/routes/v1/currencies/[...currency]/+server.ts';
		await modules[path].GET!(event('GET', caller.signal));
		expect(observed.length).toBe(step === 'currency fetch' ? 3 : 2);
		for (const signal of observed) {
			expect(signal?.reason).toBe(reason);
		}
	}
);
