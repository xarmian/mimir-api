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

export const endpoints = [
    arc200Tokens,
    arc200Balances,
    arc200Transfers,
    arc200Approvals
];