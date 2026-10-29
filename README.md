# Mimir API

Mimir API provides a suite of services for the Voi Network, helping developers build applications with easy access to chain data.

## Available APIs

Currently, the Mimir API suite includes:

- **ARC200 Token Balances API**: Query ARC-200 token balances for accounts on the Voi Network.
- **ARC200 Token Transfers API**: Query ARC-200 token transfer history on the Voi Network.
- **ARC200 Tokens API**: Query all available ARC-200 tokens on the Voi Network.
- **ARC200 Tokens Approvals API**: Query ARC-200 token approvals for accounts and tokens on Voi Network.
- **ARC72 Tokens API**: Query ARC-72 NFT token details on the Voi Network.
- **ARC72 Transfers API**: Query ARC-72 NFT token transfer history on the Voi Network.
- **ARC72 Collections API**: Query ARC-72 NFT collections data on the Voi Network.
- **Marketplace Listings API**: Query active, sold, and deleted marketplace listings on the Voi Network.
- **Marketplace Sales API**: Query completed marketplace sales on the Voi Network.
- **Marketplace Deletes API**: Query deleted marketplace listings on the Voi Network.

## Running Your Own Instance

### Prerequisites

- Node.js 22 (supported by the pinned Vercel adapter)
- Supabase account
- PostgreSQL database with Mimir schema

### Setup

1. Clone the repository:
```bash
git clone https://github.com/xarmian/mimir-api.git
cd mimir-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PUBLIC_SUPABASE_URL=your-mimir-url
PUBLIC_SUPABASE_ANON_KEY=your-mimir-anon-key
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5173`.

All server-side upstream requests use the shared client and fetch wrapper in
`src/lib/server/supabase.ts`. Each call has a 10,000 ms deadline, including response
body reads. Set the private `UPSTREAM_TIMEOUT_MS` environment variable to override
it; absent or invalid values use the default. Caller abort signals are preserved.
Keep the timeout below the 30-second Vercel function cap, allowing time for routes
that make multiple upstream calls.

Timeouts (including upstream HTTP 504/524) return status 504 with
`{"error":"Upstream request timed out"}`. Network failures and other upstream HTTP
5xx responses return 502 with `{"error":"Upstream request failed"}`. Existing query
and validation error handling remains in place.

Run `npm test` for the fetch and route regression tests. They use mocked upstreams
and require no credentials or network access. The abort tests use short real
timeouts because native `AbortSignal.timeout` does not use Vitest's fake timers.

### Production Deployment

For production deployment:

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Documentation

API Documentation can be found at `https://voi-mainnet-mimirapi.voirewards.com`.

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License.
