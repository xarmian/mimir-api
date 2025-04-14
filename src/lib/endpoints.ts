const arc200Balances = {
    title: 'ARC200 Token Balances',
    path: '/arc200/balances',
    method: 'GET',
    description: 'Get token balances for accounts on the Voi Network.',
    endpoint: 'arc200balances',
    parameters: [
      {
        name: 'contractId',
        type: 'number',
        description: 'The contract application ID',
        required: false
      },
      {
        name: 'accountId',
        type: 'string',
        description: 'The account address to get balances for',
        required: false
      },
      {
        name: 'symbol',
        type: 'string',
        description: 'Filter by token symbol',
        required: false
      },
      {
        name: 'verified',
        type: 'number',
        description: 'Filter for verified tokens (1) or unverified tokens (0)',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'next-token',
        type: 'string',
        description: 'Token for pagination',
        required: false
      }
    ],
    example: {
      request: 'GET /arc200/balances?accountId=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      response: `{
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
}`
    }
};

const arc200Transfers = {
    title: 'ARC200 Token Transfers',
    path: '/arc200/transfers',
    method: 'GET',
    description: 'Get token transfer history for ARC200 tokens on the Voi Network.',
    endpoint: 'arc200transfers',
    parameters: [
      {
        name: 'contractId',
        type: 'number',
        description: 'The contract application ID',
        required: false
      },
      {
        name: 'user',
        type: 'string',
        description: 'Filter transfers where the address is sender or receiver',
        required: false
      },
      {
        name: 'from',
        type: 'string',
        description: 'Filter by sender address',
        required: false
      },
      {
        name: 'to',
        type: 'string',
        description: 'Filter by receiver address',
        required: false
      },
      {
        name: 'round',
        type: 'number',
        description: 'Filter by round number',
        required: false
      },
      {
        name: 'min_round',
        type: 'number',
        description: 'Filter for transfers at or after this round',
        required: false
      },
      {
        name: 'max_round',
        type: 'number',
        description: 'Filter for transfers at or before this round',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Number of results to skip',
        default: '0'
      },
      {
        name: 'includes',
        type: 'string',
        description: 'Additional data to include',
        required: false
      }
    ],
    example: {
      request: 'GET /arc200/transfers?contractId=419000&limit=3',
      response: `{
"transfers": [
  {
    "transactionId": "LSIVMJMBZZVCJI27NEFZF7CVTUJMMKQNDMXEJ2G6EELVTMJBJHWA",
    "contractId": 419000,
    "timestamp": 1743773886,
    "round": 6273806,
    "sender": "THANKYOUJE4LVRECDJOBPYZXFEVOXF3VQ6QEAXB3BFZWXDFJWE27URFZ3Q",
    "receiver": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "amount": "100000000"
  }
],
"next-token": 2818368
}`
    }
};

const arc200Tokens = {
    title: 'ARC200 Tokens',
      path: '/arc200/tokens',
      method: 'GET',
      description: 'Get all available ARC200 tokens on the Voi Network.',
      endpoint: 'arc200tokens',
      parameters: [
        {
          name: 'contractId',
          type: 'number',
          description: 'The contract application ID',
          required: false
        },
        {
          name: 'symbol',
          type: 'string',
          description: 'Filter by token symbol',
          required: false
        },
        {
          name: 'verified',
          type: 'number',
          description: 'Filter for verified tokens (1) or unverified tokens (0)',
          required: false
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of results to return',
          default: '100'
        },
        {
          name: 'next-token',
          type: 'string',
          description: 'Token for pagination',
          required: false
        }
      ],
      example: {
        request: 'GET /arc200/tokens?limit=1',
        response: `{
  "current-round": 6278917,
  "total-count": 185,
  "next-token": "1",
  "tokens": [
    {
      "contractId": 420069,
      "name": "UNIT", 
      "symbol": "UNIT",
      "decimals": 8,
      "totalSupply": "2171712075756",
      "creator": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "deleted": 0,
      "verified": 1,
      "mintRound": 4224601,
      "globalState": {
        "creator": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "approvalProgram": "...",
        "clearStateProgram": "...",
        "globalStateSchema": {
          "numUint": 0,
          "numByteSlice": 0
        },
        "localStateSchema": {
          "numUint": 0,
          "numByteSlice": 0
        },
        "extraProgramPages": 0
      }
    }
  ]
}`
      }
};

const arc200Approvals = {
    title: 'ARC200 Token Approvals',
    path: '/arc200/approvals',
    method: 'GET',
    description: 'Get token approval information for ARC200 tokens on the Voi Network.',
    endpoint: 'arc200approvals',
    parameters: [
      {
        name: 'contractId',
        type: 'number',
        description: 'The contract application ID',
        required: false
      },
      {
        name: 'owner',
        type: 'string',
        description: 'Filter by owner address',
        required: false
      },
      {
        name: 'spender',
        type: 'string',
        description: 'Filter by spender address',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'next-token',
        type: 'string',
        description: 'Token for pagination',
        required: false
      }
    ],
    example: {
      request: 'GET /arc200/approvals?owner=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      response: `{
  "results": [
    {
      "contractId": 420069,
      "owner": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "spender": "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "amount": "1000000000",
      "transactionId": "LSIVMJMBZZVCJI27NEFZF7CVTUJMMKQNDMXEJ2G6EELVTMJBJHWA",
      "round": 6278517
    }
  ],
  "next_token": null,
  "total-count": 12,
  "current-round": 6278517
}`
    }
};

const arc72Tokens = {
    title: 'ARC72 Tokens',
    path: '/nft-indexer/v1/tokens',
    method: 'GET',
    description: 'Get all available ARC72 tokens on the Voi Network.',
    endpoint: 'arc72tokens',
    parameters: [
      {
        name: 'contractId',
        type: 'number',
        description: 'The contract application ID',
        required: false
      },
      {
        name: 'tokenId',
        type: 'string',
        description: 'Filter by token ID',
        required: false
      },
      {
        name: 'owner',
        type: 'string',
        description: 'Filter by owner address',
        required: false
      },
      {
        name: 'approved',
        type: 'string',
        description: 'Filter by approved address',
        required: false
      },
      {
        name: 'tokenIds',
        type: 'string',
        description: 'Filter by token IDs',
        required: false
      },
      {
        name: 'round',
        type: 'number',
        description: 'Filter by round number',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'next-token',
        type: 'string',
        description: 'Token for pagination',
        required: false
      }
    ],
    example: {
      request: 'GET /nft-indexer/v1/tokens',
      response: `{
  "tokens": [
    {
      "owner": "C5NZ5SNL5EMOEVKFW3DS3DBG3FNMIYJAJY3U4I5SRCOXHGY33ML3TGHD24",
      "tokenId": "1",
      "approved": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
      "isBurned": false,
      "metadata": "{\"name\":\"DORK1\",\"description\":\"A very serious project about a growing problem. In this episode, the dorks find themselves in the new waters of Voi. With their numbers vastly diminished, they could one day recover...\",\"image\":\"https://prod.cdn.highforge.io/m/313597/1.webp\",\"image_integrity\":\"/OT6Q1xeNygwyzqtyjE6qTW4Czs3l0DRriVGI8RPJyg=\",\"image_mimetype\":\"image/png\",\"properties\":{\"BACKGROUND\":\"Aquamarine\",\"BODY\":\"Red\",\"ON BODY\":\"Scar\"},\"royalties\":\"AaQnEAAAAAAboqOlU1Py+usrlzt+P8Wv6rJ+GYfjkTdjbFVw98rWlwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\"}",
      "verified": 0,
      "contractId": 313597,
      "mint-round": 429700,
      "blacklisted": false,
      "lastUpdated": "2025-04-11T22:51:19Z",
      "metadataURI": "https://prod.cdn.highforge.io/m/313597/1.json#arc3",
      "collectionName": null
    }
 ],
  "next-token": null,
  "total-count": 50,
  "current-round": 6500841
}`
    }
};

const arc72Transfers = {
    title: 'ARC72 Token Transfers',
    path: '/nft-indexer/v1/transfers',
    method: 'GET',
    description: 'Get all available ARC72 token transfers on the Voi Network.',
    endpoint: 'arc72transfers',
    parameters: [
      {
        name: 'contractId',
        type: 'number',
        description: 'The contract application ID',
        required: false
      },
      {
        name: 'tokenId',
        type: 'string',
        description: 'Filter by token ID',
        required: false
      },
      {
        name: 'user',
        type: 'string',
        description: 'Filter by user address',
        required: false
      },
      {
        name: 'from',
        type: 'string',
        description: 'Filter by sender address',
        required: false
      },
      {
        name: 'to',
        type: 'string',
        description: 'Filter by receiver address',
        required: false
      },
      {
        name: 'round',
        type: 'number',
        description: 'Filter by round number',
        required: false
      },
      {
        name: 'min-round',
        type: 'number',
        description: 'Filter for transfers at or after this round',
        required: false
      },
      {
        name: 'max-round',
        type: 'number',
        description: 'Filter for transfers at or before this round',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'next-token',
        type: 'string',
        description: 'Token for pagination',
        required: false
      }
    ],
    example: {
      request: 'GET /nft-indexer/v1/transfers',
      response: `{
  "transfers": [
    {
      "note": "arccjs-v2.10.6:u arc72_transferFrom transaction",
      "round": 6498253,
      "toAddr": "R7TBR3Y5QCM6Y2OPQP3BPNUQG7TLN75IOC2WTNRUKO4VPNSDQF52MZB4ZE",
      "tokenId": "559",
      "fromAddr": "H7W63MIQJMYBOEYPM5NJEGX3P54H54RZIV2G3OQ2255AULG6U74BE5KFC4",
      "timestamp": 1744406418,
      "contractId": "447482",
      "transactionId": "W6LAGS4UT5SIBPF6ZQPHARQ6WDOZGINK5NWGXU2PVQULVV6MZO4Q"
    }
  ],
  "next-token": null,
  "total-count": 1,
  "current-round": 6500841
}`
    }
};

const arc72Collections = {
    title: 'ARC72 Collections',
    path: '/nft-indexer/v1/collections',
    method: 'GET',
    description: 'Get all available ARC72 NFT collections on the Voi Network.',
    endpoint: 'arc72collections',
    parameters: [
      {
        name: 'contractId',
        type: 'string',
        description: 'The contract application ID or comma-separated list of IDs',
        required: false
      },
      {
        name: 'verified',
        type: 'number',
        description: 'Filter for verified collections (1) or unverified collections (0)',
        required: false
      },
      {
        name: 'blacklisted',
        type: 'boolean',
        description: 'Filter for blacklisted collections',
        required: false
      },
      {
        name: 'creator',
        type: 'string',
        description: 'Filter by creator address',
        required: false
      },
      {
        name: 'mint-min-round',
        type: 'number',
        description: 'Filter for collections minted at or after this round',
        required: false
      },
      {
        name: 'mint-max-round',
        type: 'number',
        description: 'Filter for collections minted at or before this round',
        required: false
      },
      {
        name: 'includes',
        type: 'string',
        description: 'Additional data to include (use "tokens" to include collection tokens)',
        required: false
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum number of results to return',
        default: '100'
      },
      {
        name: 'next-token',
        type: 'string',
        description: 'Token for pagination',
        required: false
      }
    ],
    example: {
      request: 'GET /nft-indexer/v1/collections',
      response: `{
  "current-round": 6500841,
  "total-count": 50,
  "next-token": null,
  "collections": [
    {
      "contractId": 447482,
      "name": "Voi Punks",
      "totalSupply": 10000,
      "mintRound": 1234567,
      "blacklisted": false,
      "creator": "H7W63MIQJMYBOEYPM5NJEGX3P54H54RZIV2G3OQ2255AULG6U74BE5KFC4",
      "imageUrl": "https://example.com/collection/image.png",
      "deleted": 0,
      "globalState": [],
      "uniqueOwners": 2500,
      "burnedSupply": 5,
      "verified": 1,
      "metadata": "{}",
      "firstToken": {
        "tokenId": "1",
        "metadata": "{\\"name\\":\\"Voi Punk #1\\",\\"description\\":\\"First Voi Punk\\",\\"image\\":\\"https://example.com/1.png\\"}",
        "owner": "H7W63MIQJMYBOEYPM5NJEGX3P54H54RZIV2G3OQ2255AULG6U74BE5KFC4",
        "approved": null,
        "mintRound": 1234567
      }
    }
  ]
}`
    }
};

export const endpoints = [
    arc200Tokens,
    arc200Balances,
    arc200Transfers,
    arc200Approvals,
    arc72Tokens,
    arc72Transfers,
    arc72Collections
];