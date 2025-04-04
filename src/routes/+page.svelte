<script lang="ts">
  import { onMount } from 'svelte';
  import EndpointDetail from '$lib/components/EndpointDetail.svelte';
  import ApiPlayground from '$lib/components/ApiPlayground.svelte';

  let isDarkMode = false;
  let activeTab = 'docs';
  let selectedEndpoint: string | undefined = undefined;

  function goToPlayground(endpoint: string) {
    activeTab = 'playground';
    selectedEndpoint = endpoint;
  }

  const endpoints = [
    {
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
    },
    {
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
    }
  ];

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    isDarkMode = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
  });

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
  }
</script>

<svelte:head>
  <title>Mimir API - Voi Network</title>
  <meta name="description" content="A suite of APIs for the Voi Network" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Favicon -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="shortcut icon" href="/favicon.ico">
  
  <!-- Theme and Social Media -->
  <meta name="theme-color" content={isDarkMode ? "#1a1a1a" : "#ffffff"}>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Mimir API - Voi Network">
  <meta name="twitter:description" content="A suite of APIs for the Voi Network">
  <meta name="twitter:image" content="https://mimir-api.voi.network/android-chrome-512x512.png">
  <meta property="og:title" content="Mimir API - Voi Network">
  <meta property="og:description" content="A suite of APIs for the Voi Network">
  <meta property="og:url" content="https://mimir-api.voi.network">
  <meta property="og:image" content="https://mimir-api.voi.network/android-chrome-512x512.png">
  <meta property="og:type" content="website">
</svelte:head>

<div class="app">
  <header>
    <div class="header-content">
      <div class="logo-container">
        <img src="/android-chrome-192x192.png" alt="Mimir API Logo" class="logo" />
        <h1>Mimir API</h1>
      </div>
      <div class="header-right">
        <button 
          class="theme-toggle" 
          on:click={toggleTheme}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <nav>
          <button 
            class:active={activeTab === 'docs'} 
            on:click={() => activeTab = 'docs'}>
            Documentation
          </button>
          <button 
            class:active={activeTab === 'playground'} 
            on:click={() => activeTab = 'playground'}>
            Try It
          </button>
        </nav>
      </div>
    </div>
  </header>

  <main class="container">
    {#if activeTab === 'docs'}
      <div class="docs">
        <section>
          <h2>Quick Start</h2>
          <p>Mimir API provides a suite of services for the Voi Network, helping developers build applications with easy access to chain data.</p>
          
          <div class="changes">
            <div class="version">
              <h3>Recent Changes</h3>
              <ul>
                <li>2024-04-04: Added ARC200 token transfers API endpoint.</li>
                <li>2024-04-04: Initial release with ARC200 token balances API.</li>
              </ul>
            </div>
          </div>

          <div class="endpoints">
            {#each endpoints as endpoint}
              <EndpointDetail 
                {endpoint} 
                on:try={(e) => goToPlayground(e.detail)} />
            {/each}
          </div>
        </section>
      </div>
    {:else}
      <ApiPlayground {selectedEndpoint} />
    {/if}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
  }
  :global(:root) {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border-color: #e5e5e5;
    --code-bg: #f1f3f5;
    --accent-color: #6366F1;
  }

  :global(.dark-theme) {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --text-primary: #ffffff;
    --text-secondary: #a0aec0;
    --border-color: #404040;
    --code-bg: #2d2d2d;
  }

  .app {
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  header {
    background: var(--bg-secondary);
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .header-content {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo {
    width: 32px;
    height: 32px;
    border-radius: 4px;
  }

  .theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
  }

  nav button {
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 4px;
  }

  nav button:hover {
    background: var(--bg-hover);
  }

  nav button.active {
    color: var(--text-primary);
    background: var(--bg-hover);
    font-weight: 500;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .endpoints {
    display: grid;
    gap: 2rem;
    margin: 2rem 0;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
    }

    .container {
      padding: 1rem;
    }
  }

  .changes {
    margin: 2rem 0;
  }

  .version {
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .version h3 {
    margin: 0 0 0.5rem 0;
    color: var(--accent-color);
  }

  .version ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .version li {
    margin: 0.5rem 0;
    line-height: 1.5;
  }
</style>
