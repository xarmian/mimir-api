<script lang="ts">
  export let selectedEndpoint: string | undefined = undefined;
  let contractId = '';
  let accountId = '';
  let symbol = '';
  let verified = '';
  let limit = 100;
  let nextToken = '';
  let user = '';
  let from = '';
  let to = '';
  let round = '';
  let minRound = '';
  let maxRound = '';
  let offset = 0;
  let includes = '';
  let response: any = null;
  let isLoading = false;
  let error: string | null = null;
  let selectedLanguage = 'curl';

  // Default to 'arc200balances' if no endpoint is selected
  $: actualEndpoint = selectedEndpoint || 'arc200balances';

  $: requestUrl = (() => {
    const baseUrl = window.location.origin;
    
    if (actualEndpoint === 'arc200balances') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (accountId) searchParams.set('accountId', accountId);
      if (symbol) searchParams.set('symbol', symbol);
      if (verified) searchParams.set('verified', verified);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/arc200/balances${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'arc200transfers') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (user) searchParams.set('user', user);
      if (from) searchParams.set('from', from);
      if (to) searchParams.set('to', to);
      if (round) searchParams.set('round', round);
      if (minRound) searchParams.set('min_round', minRound);
      if (maxRound) searchParams.set('max_round', maxRound);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (offset !== 0) searchParams.set('offset', offset.toString());
      if (includes) searchParams.set('includes', includes);
      const queryString = searchParams.toString();
      return `${baseUrl}/arc200/transfers${queryString ? `?${queryString}` : ''}`;
    }
    
    return `${baseUrl}`;
  })();

  $: codeExample = (() => {
    switch (selectedLanguage) {
      case 'curl':
        return `curl "${requestUrl}"`;
      
      case 'javascript':
        return `fetch("${requestUrl}")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
      
      case 'python':
        return `import requests

response = requests.get("${requestUrl}")
data = response.json()
print(data)`;
      
      case 'php':
        return `<?php
$response = file_get_contents("${requestUrl}");
$data = json_decode($response, true);
print_r($data);`;
      
      case 'go':
        return `package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func main() {
    resp, err := http.Get("${requestUrl}")
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    var data interface{}
    json.Unmarshal(body, &data)
    fmt.Println(data)
}`;

      default:
        return '';
    }
  })();

  async function sendRequest() {
    let options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    isLoading = true;
    error = null;

    try {
      const res = await fetch(requestUrl, options);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Request failed');
      }
      response = await res.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch response';
      response = null;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="playground">
  <h2>Try the API</h2>
  <div class="playground-content">
    <div class="input-section">
      <div class="input-group">
        <label for="endpoint">Endpoint</label>
        <select id="endpoint" bind:value={actualEndpoint} class="endpoint-select">
          <option value="arc200balances">ARC200 Token Balances</option>
          <option value="arc200transfers">ARC200 Token Transfers</option>
        </select>
      </div>

      {#if actualEndpoint === 'arc200balances'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC200 contract ID" />
        </div>
        <div class="input-group">
          <label for="accountId">Account ID (optional)</label>
          <input 
            type="text" 
            id="accountId"
            bind:value={accountId} 
            placeholder="Enter account address" />
        </div>
        <div class="input-group">
          <label for="symbol">Symbol (optional)</label>
          <input 
            type="text" 
            id="symbol"
            bind:value={symbol} 
            placeholder="Enter token symbol" />
        </div>
        <div class="input-group">
          <label for="verified">Verified (optional)</label>
          <select id="verified" bind:value={verified}>
            <option value="">All tokens</option>
            <option value="1">Verified only</option>
            <option value="0">Unverified only</option>
          </select>
        </div>
        <div class="input-group">
          <label for="limit">Result Limit (optional)</label>
          <input 
            type="number" 
            id="limit"
            bind:value={limit} 
            min="1" 
            max="1000" 
            placeholder="Result limit" />
        </div>
        <div class="input-group">
          <label for="nextToken">Next Token (optional)</label>
          <input 
            type="text" 
            id="nextToken"
            bind:value={nextToken} 
            placeholder="Token for pagination" />
        </div>
      {:else if actualEndpoint === 'arc200transfers'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC200 contract ID" />
        </div>
        <div class="input-group">
          <label for="user">User Address (optional)</label>
          <input 
            type="text" 
            id="user"
            bind:value={user} 
            placeholder="Address that is either sender or receiver" />
        </div>
        <div class="input-group">
          <label for="from">From Address (optional)</label>
          <input 
            type="text" 
            id="from"
            bind:value={from} 
            placeholder="Sender address" />
        </div>
        <div class="input-group">
          <label for="to">To Address (optional)</label>
          <input 
            type="text" 
            id="to"
            bind:value={to} 
            placeholder="Receiver address" />
        </div>
        <div class="input-group">
          <label for="round">Round (optional)</label>
          <input 
            type="number" 
            id="round"
            bind:value={round} 
            placeholder="Specific round number" />
        </div>
        <div class="input-group">
          <label for="minRound">Min Round (optional)</label>
          <input 
            type="number" 
            id="minRound"
            bind:value={minRound} 
            placeholder="Minimum round number" />
        </div>
        <div class="input-group">
          <label for="maxRound">Max Round (optional)</label>
          <input 
            type="number" 
            id="maxRound"
            bind:value={maxRound} 
            placeholder="Maximum round number" />
        </div>
        <div class="input-group">
          <label for="limit">Result Limit (optional)</label>
          <input 
            type="number" 
            id="limit"
            bind:value={limit} 
            min="1" 
            max="1000" 
            placeholder="Result limit" />
        </div>
        <div class="input-group">
          <label for="offset">Offset (optional)</label>
          <input 
            type="number" 
            id="offset"
            bind:value={offset} 
            min="0" 
            placeholder="Number of results to skip" />
        </div>
        <div class="input-group">
          <label for="includes">Includes (optional)</label>
          <input 
            type="text" 
            id="includes"
            bind:value={includes} 
            placeholder="Additional data to include" />
        </div>
      {/if}

      <div class="request-preview">
        <div class="code-header">
          <h3>Request Example</h3>
          <div class="language-selector">
            <select bind:value={selectedLanguage} class="language-select mobile-only">
              <option value="curl">cURL</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
            </select>
            <div class="language-tabs desktop-only">
              <button 
                class:active={selectedLanguage === 'curl'}
                on:click={() => selectedLanguage = 'curl'}>
                cURL
              </button>
              <button 
                class:active={selectedLanguage === 'javascript'}
                on:click={() => selectedLanguage = 'javascript'}>
                JavaScript
              </button>
              <button 
                class:active={selectedLanguage === 'python'}
                on:click={() => selectedLanguage = 'python'}>
                Python
              </button>
              <button 
                class:active={selectedLanguage === 'php'}
                on:click={() => selectedLanguage = 'php'}>
                PHP
              </button>
              <button 
                class:active={selectedLanguage === 'go'}
                on:click={() => selectedLanguage = 'go'}>
                Go
              </button>
            </div>
          </div>
        </div>
        <div class="code-block">
          <pre><code>{codeExample}</code></pre>
          <button 
            class="copy-button" 
            on:click={() => navigator.clipboard.writeText(codeExample)}
            title="Copy to clipboard"
            aria-label="Copy code example">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
        </div>
      </div>

      <button 
        class="send-button"
        on:click={sendRequest}
        disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Send Request'}
      </button>

      {#if error}
        <div class="error">
          <p>Error: {error}</p>
        </div>
      {/if}

      {#if response}
        <div class="response">
          <h3>Response</h3>
          <div class="code-block">
            <pre><code>{JSON.stringify(response, null, 2)}</code></pre>
            <button 
              class="copy-button" 
              on:click={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
              title="Copy to clipboard"
              aria-label="Copy response data">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .playground {
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
  }

  .playground-content {
    display: grid;
    gap: 2rem;
  }

  .input-section {
    display: grid;
    gap: 1.5rem;
  }

  .input-group {
    display: grid;
    gap: 0.5rem;
  }

  label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  input, select {
    padding: 0.75rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
    width: 100%;
  }

  .endpoint-select {
    font-weight: 500;
  }

  .request-preview {
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }

  .code-header {
    padding: 1rem;
    background: var(--bg-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .language-tabs {
    display: flex;
  }

  .language-tabs button {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  .language-tabs button.active {
    color: var(--accent-color);
    font-weight: 500;
  }

  .send-button {
    padding: 1rem;
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    margin-top: 1rem;
  }

  .send-button:hover {
    opacity: 0.9;
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .code-block {
    position: relative;
    background: var(--code-bg);
  }

  .code-block pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    font-family: monospace;
  }

  .copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .code-block:hover .copy-button {
    opacity: 1;
  }

  .copy-button:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .error {
    padding: 1rem;
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 4px;
    margin-top: 1rem;
  }

  .error p {
    margin: 0;
    color: rgb(220, 38, 38);
  }

  .response {
    margin-top: 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }

  .response h3 {
    margin: 0;
    padding: 1rem;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
  }

  @media (max-width: 768px) {
    .playground {
      padding: 1.5rem;
    }

    .desktop-only {
      display: none;
    }
  }

  @media (min-width: 769px) {
    .mobile-only {
      display: none;
    }
  }
</style> 