import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { GET } from '../src/routes/v1/currencies/[...currency]/+server';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://upstream.invalid',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: { UPSTREAM_TIMEOUT_MS: '10' } }));

beforeEach(() => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function event(currency = 'EUR'): RequestEvent {
	const url = new URL('https://app.invalid/v1/currencies/' + currency);
	const fixture: Pick<RequestEvent, 'url' | 'params' | 'request'> = {
		url,
		params: { currency },
		request: new Request(url)
	};
	return fixture as RequestEvent;
}

it('returns 504 JSON when the currency body aborts after headers on our deadline', async () => {
	vi.stubGlobal(
		'fetch',
		vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(new Response('1'))
			.mockResolvedValueOnce(new Response('1'))
			.mockImplementation(
				async (_input, init) =>
					new Response(
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
					)
			)
	);
	const response = await GET(event());
	expect(response.status).toBe(504);
	expect(await response.json()).toEqual({ error: 'Upstream request timed out' });
	expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
});

it.each([400, 404, 429, 500, 504, 524])(
	'returns 502 JSON for a direct currency upstream HTTP %i',
	async (status) => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn<typeof fetch>()
				.mockResolvedValueOnce(new Response('1'))
				.mockResolvedValueOnce(new Response('1'))
				.mockResolvedValueOnce(new Response('Upstream error details', { status }))
		);
		const response = await GET(event());
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ error: 'Upstream request failed' });
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	}
);
