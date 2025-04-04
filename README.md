# Mimir API

Mimir API provides a suite of services for the Voi Network, helping developers build applications with easy access to chain data.

## Available APIs

Currently, the Mimir API suite includes:

- **ARC200 Token Balances API**: Query ARC-200 token balances for accounts on the Voi Network.

## Running Your Own Instance

### Prerequisites

- Node.js 18 or later
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

The API will be available at `http://localhost:3000`.

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

Consider using a process manager like PM2 for production deployments:
```bash
npm install -g pm2
pm2 start build/index.js --name mimir-api
```

## API Documentation

### ARC200 Token Balances

**Endpoint:** `/arc200/balances`

**Method:** GET

**Query Parameters:**

- `contractId` (optional): The contract application ID
- `accountId` (optional): The account address to get balances for
- `symbol` (optional): Filter by token symbol
- `verified` (optional): Filter for verified tokens (1) or unverified tokens (0)
- `limit` (optional): Maximum number of results to return, default is 100
- `next-token` (optional): Token for pagination

**Example Response:**

```json
{
  "results": [
    {
      "name": "UNIT",
      "symbol": "UNIT",
      "balance": "2171712075756",
      "decimals": 8,
      "verified": 1,
      "accountId": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "contractId": 420069
    }
  ],
  "next_token": null,
  "total-count": 4224,
  "current-round": 6278517
}
```

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
