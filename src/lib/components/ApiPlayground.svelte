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
  let minTimestamp = '';
  let maxTimestamp = '';
  let offset = 0;
  let includes = '';
  let owner = '';
  let spender = '';
  let response: any = null;
  let isLoading = false;
  let error: string | null = null;
  let selectedLanguage = 'curl';
  let tokenId = '';
  let tokenIds = '';
  let approved = '';
  let blacklisted = '';
  let creator = '';
  let mintMinRound = '';
  let mintMaxRound = '';
  // Marketplace specific fields
  let mpContractId = '';
  let mpListingId = '';
  let collectionId = '';
  let seller = '';
  let buyer = '';
  let minPrice = '';
  let maxPrice = '';
  let currency = '';
  let active = '';
  let sold = '';
  let deleted = '';
  let sort = '';

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
    } else if (actualEndpoint === 'arc200tokens') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (symbol) searchParams.set('symbol', symbol);
      if (verified) searchParams.set('verified', verified);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/arc200/tokens${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'arc200approvals') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (owner) searchParams.set('owner', owner);
      if (spender) searchParams.set('spender', spender);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/arc200/approvals${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'arc72tokens') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (tokenId) searchParams.set('tokenId', tokenId);
      if (owner) searchParams.set('owner', owner);
      if (tokenIds) searchParams.set('tokenIds', tokenIds);
      if (approved) searchParams.set('approved', approved);
      if (round) searchParams.set('round', round);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/tokens${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'arc72transfers') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (tokenId) searchParams.set('tokenId', tokenId);
      if (user) searchParams.set('user', user);
      if (from) searchParams.set('from', from);
      if (to) searchParams.set('to', to);
      if (round) searchParams.set('round', round);
      if (minRound) searchParams.set('min-round', minRound);
      if (maxRound) searchParams.set('max-round', maxRound);
      if (minTimestamp) searchParams.set('min-time', minTimestamp);
      if (maxTimestamp) searchParams.set('max-time', maxTimestamp);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/transfers${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'arc72collections') {
      const searchParams = new URLSearchParams();
      if (contractId) searchParams.set('contractId', contractId);
      if (verified) searchParams.set('verified', verified);
      if (blacklisted) searchParams.set('blacklisted', blacklisted);
      if (creator) searchParams.set('creator', creator);
      if (mintMinRound) searchParams.set('mint-min-round', mintMinRound);
      if (mintMaxRound) searchParams.set('mint-max-round', mintMaxRound);
      if (includes) searchParams.set('includes', includes);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/collections${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'mplistings') {
      const searchParams = new URLSearchParams();
      if (mpContractId) searchParams.set('mpContractId', mpContractId);
      if (mpListingId) searchParams.set('mpListingId', mpListingId);
      if (collectionId) searchParams.set('collectionId', collectionId);
      if (tokenId) searchParams.set('tokenId', tokenId);
      if (seller) searchParams.set('seller', seller);
      if (minRound) searchParams.set('min-round', minRound);
      if (maxRound) searchParams.set('max-round', maxRound);
      if (minPrice) searchParams.set('min-price', minPrice);
      if (maxPrice) searchParams.set('max-price', maxPrice);
      if (minTimestamp) searchParams.set('min-time', minTimestamp);
      if (maxTimestamp) searchParams.set('max-time', maxTimestamp);
      if (currency) searchParams.set('currency', currency);
      if (active) searchParams.set('active', active);
      if (sold) searchParams.set('sold', sold);
      if (deleted) searchParams.set('deleted', deleted);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/mp/listings${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'mpsales') {
      const searchParams = new URLSearchParams();
      if (mpContractId) searchParams.set('mpContractId', mpContractId);
      if (mpListingId) searchParams.set('mpListingId', mpListingId);
      if (collectionId) searchParams.set('collectionId', collectionId);
      if (tokenId) searchParams.set('tokenId', tokenId);
      if (seller) searchParams.set('seller', seller);
      if (buyer) searchParams.set('buyer', buyer);
      if (user) searchParams.set('user', user);
      if (minRound) searchParams.set('min-round', minRound);
      if (maxRound) searchParams.set('max-round', maxRound);
      if (minPrice) searchParams.set('min-price', minPrice);
      if (maxPrice) searchParams.set('max-price', maxPrice);
      if (minTimestamp) searchParams.set('min-time', minTimestamp);
      if (maxTimestamp) searchParams.set('max-time', maxTimestamp);
      if (currency) searchParams.set('currency', currency);
      if (sort) searchParams.set('sort', sort);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/mp/sales${queryString ? `?${queryString}` : ''}`;
    } else if (actualEndpoint === 'mpdeletes') {
      const searchParams = new URLSearchParams();
      if (mpContractId) searchParams.set('mpContractId', mpContractId);
      if (mpListingId) searchParams.set('mpListingId', mpListingId);
      if (collectionId) searchParams.set('collectionId', collectionId);
      if (tokenId) searchParams.set('tokenId', tokenId);
      if (owner) searchParams.set('owner', owner);
      if (minRound) searchParams.set('min-round', minRound);
      if (maxRound) searchParams.set('max-round', maxRound);
      if (minTimestamp) searchParams.set('min-time', minTimestamp);
      if (maxTimestamp) searchParams.set('max-time', maxTimestamp);
      if (sort) searchParams.set('sort', sort);
      if (limit !== 100) searchParams.set('limit', limit.toString());
      if (nextToken) searchParams.set('next-token', nextToken);
      const queryString = searchParams.toString();
      return `${baseUrl}/nft-indexer/v1/mp/deletes${queryString ? `?${queryString}` : ''}`;
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
          <option value="arc200tokens">ARC200 Tokens</option>
          <option value="arc200approvals">ARC200 Token Approvals</option>
          <option value="arc72tokens">ARC72 Tokens</option>
          <option value="arc72transfers">ARC72 Token Transfers</option>
          <option value="arc72collections">ARC72 Collections</option>
          <option value="mplistings">Marketplace Listings</option>
          <option value="mpsales">Marketplace Sales</option>
          <option value="mpdeletes">Marketplace Deletes</option>
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
      {:else if actualEndpoint === 'arc200tokens'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC200 contract ID" />
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
      {:else if actualEndpoint === 'arc200approvals'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC200 contract ID" />
        </div>
        <div class="input-group">
          <label for="owner">Owner Address (optional)</label>
          <input 
            type="text" 
            id="owner"
            bind:value={owner} 
            placeholder="Token owner address" />
        </div>
        <div class="input-group">
          <label for="spender">Spender Address (optional)</label>
          <input 
            type="text" 
            id="spender"
            bind:value={spender} 
            placeholder="Token spender address" />
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
      {:else if actualEndpoint === 'arc72tokens'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC72 contract ID" />
        </div>
        <div class="input-group">
          <label for="tokenId">Token ID (optional)</label>
          <input 
            type="text" 
            id="tokenId"
            bind:value={tokenId} 
            placeholder="Enter token ID" />
        </div>
        <div class="input-group">
          <label for="owner">Owner Address (optional)</label>
          <input 
            type="text" 
            id="owner"
            bind:value={owner} 
            placeholder="Token owner address" />
        </div>
        <div class="input-group">
          <label for="tokenIds">Token IDs (optional, comma-separated)</label>
          <input 
            type="text" 
            id="tokenIds"
            bind:value={tokenIds} 
            placeholder="Comma-separated token IDs" />
        </div>
        <div class="input-group">
          <label for="approved">Approved Address (optional)</label>
          <input 
            type="text" 
            id="approved"
            bind:value={approved} 
            placeholder="Approved address" />
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
      {:else if actualEndpoint === 'arc72transfers'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC72 contract ID" />
        </div>
        <div class="input-group">
          <label for="tokenId">Token ID (optional)</label>
          <input 
            type="text" 
            id="tokenId"
            bind:value={tokenId} 
            placeholder="Enter token ID" />
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
          <label for="minTimestamp">Min Timestamp (optional)</label>
          <input 
            type="number" 
            id="minTimestamp"
            bind:value={minTimestamp} 
            placeholder="Minimum timestamp" />
        </div>
        <div class="input-group">
          <label for="maxTimestamp">Max Timestamp (optional)</label>
          <input 
            type="number" 
            id="maxTimestamp"
            bind:value={maxTimestamp} 
            placeholder="Maximum timestamp" />
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
      {:else if actualEndpoint === 'arc72collections'}
        <div class="input-group">
          <label for="contractId">Contract ID (optional)</label>
          <input 
            type="number" 
            id="contractId"
            bind:value={contractId} 
            placeholder="Enter ARC72 contract ID" />
        </div>
        <div class="input-group">
          <label for="verified">Verified (optional)</label>
          <select id="verified" bind:value={verified}>
            <option value="">All collections</option>
            <option value="1">Verified only</option>
            <option value="0">Unverified only</option>
          </select>
        </div>
        <div class="input-group">
          <label for="blacklisted">Blacklisted (optional)</label>
          <select id="blacklisted" bind:value={blacklisted}>
            <option value="">All collections</option>
            <option value="true">Blacklisted only</option>
            <option value="false">Non-blacklisted only</option>
          </select>
        </div>
        <div class="input-group">
          <label for="creator">Creator Address (optional)</label>
          <input 
            type="text" 
            id="creator"
            bind:value={creator} 
            placeholder="Token creator address" />
        </div>
        <div class="input-group">
          <label for="mintMinRound">Mint Min Round (optional)</label>
          <input 
            type="number" 
            id="mintMinRound"
            bind:value={mintMinRound} 
            placeholder="Minimum mint round" />
        </div>
        <div class="input-group">
          <label for="mintMaxRound">Mint Max Round (optional)</label>
          <input 
            type="number" 
            id="mintMaxRound"
            bind:value={mintMaxRound} 
            placeholder="Maximum mint round" />
        </div>
        <div class="input-group">
          <label for="includes">Includes (optional)</label>
          <input 
            type="text" 
            id="includes"
            bind:value={includes} 
            placeholder="Additional data to include" />
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
      {:else if actualEndpoint === 'mplistings'}
        <div class="input-group">
          <label for="mpContractId">Marketplace Contract ID (optional)</label>
          <input 
            type="number" 
            id="mpContractId"
            bind:value={mpContractId} 
            placeholder="Enter marketplace contract ID" />
        </div>
        <div class="input-group">
          <label for="mpListingId">Listing ID (optional)</label>
          <input 
            type="text" 
            id="mpListingId"
            bind:value={mpListingId} 
            placeholder="Enter listing ID" />
        </div>
        <div class="input-group">
          <label for="collectionId">Collection ID (optional)</label>
          <input 
            type="text" 
            id="collectionId"
            bind:value={collectionId} 
            placeholder="Enter collection contract ID" />
        </div>
        <div class="input-group">
          <label for="tokenId">Token ID (optional)</label>
          <input 
            type="text" 
            id="tokenId"
            bind:value={tokenId} 
            placeholder="Enter token ID" />
        </div>
        <div class="input-group">
          <label for="seller">Seller (optional)</label>
          <input 
            type="text" 
            id="seller"
            bind:value={seller} 
            placeholder="Enter seller address" />
        </div>
        <div class="input-group">
          <label for="minRound">Min Round (optional)</label>
          <input 
            type="number" 
            id="minRound"
            bind:value={minRound} 
            placeholder="Enter minimum round" />
        </div>
        <div class="input-group">
          <label for="maxRound">Max Round (optional)</label>
          <input 
            type="number" 
            id="maxRound"
            bind:value={maxRound} 
            placeholder="Enter maximum round" />
        </div>
        <div class="input-group">
          <label for="minPrice">Min Price (optional)</label>
          <input 
            type="number" 
            id="minPrice"
            bind:value={minPrice} 
            placeholder="Enter minimum price" />
        </div>
        <div class="input-group">
          <label for="maxPrice">Max Price (optional)</label>
          <input 
            type="number" 
            id="maxPrice"
            bind:value={maxPrice} 
            placeholder="Enter maximum price" />
        </div>
        <div class="input-group">
          <label for="minTimestamp">Min Timestamp (optional)</label>
          <input 
            type="number" 
            id="minTimestamp"
            bind:value={minTimestamp} 
            placeholder="Enter minimum timestamp" />
        </div>
        <div class="input-group">
          <label for="maxTimestamp">Max Timestamp (optional)</label>
          <input 
            type="number" 
            id="maxTimestamp"
            bind:value={maxTimestamp} 
            placeholder="Enter maximum timestamp" />
        </div>
        <div class="input-group">
          <label for="currency">Currency (optional)</label>
          <input 
            type="text" 
            id="currency"
            bind:value={currency} 
            placeholder="Enter currency ID (0 for native token)" />
        </div>
        <div class="input-group">
          <label for="active">Active (optional)</label>
          <select id="active" bind:value={active}>
            <option value="">Select</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <div class="input-group">
          <label for="sold">Sold (optional)</label>
          <select id="sold" bind:value={sold}>
            <option value="">Select</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <div class="input-group">
          <label for="deleted">Deleted (optional)</label>
          <select id="deleted" bind:value={deleted}>
            <option value="">Select</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <div class="input-group">
          <label for="limit">Limit (optional)</label>
          <input 
            type="number" 
            id="limit"
            bind:value={limit} 
            placeholder="Enter result limit" />
        </div>
        <div class="input-group">
          <label for="nextToken">Next Token (optional)</label>
          <input 
            type="text" 
            id="nextToken"
            bind:value={nextToken} 
            placeholder="Enter pagination token" />
        </div>
      {:else if actualEndpoint === 'mpsales'}
        <div class="input-group">
          <label for="mpContractId">Marketplace Contract ID (optional)</label>
          <input 
            type="number" 
            id="mpContractId"
            bind:value={mpContractId} 
            placeholder="Enter marketplace contract ID" />
        </div>
        <div class="input-group">
          <label for="mpListingId">Listing ID (optional)</label>
          <input 
            type="text" 
            id="mpListingId"
            bind:value={mpListingId} 
            placeholder="Enter listing ID" />
        </div>
        <div class="input-group">
          <label for="collectionId">Collection ID (optional)</label>
          <input 
            type="text" 
            id="collectionId"
            bind:value={collectionId} 
            placeholder="Enter collection contract ID" />
        </div>
        <div class="input-group">
          <label for="tokenId">Token ID (optional)</label>
          <input 
            type="text" 
            id="tokenId"
            bind:value={tokenId} 
            placeholder="Enter token ID" />
        </div>
        <div class="input-group">
          <label for="seller">Seller (optional)</label>
          <input 
            type="text" 
            id="seller"
            bind:value={seller} 
            placeholder="Enter seller address" />
        </div>
        <div class="input-group">
          <label for="buyer">Buyer (optional)</label>
          <input 
            type="text" 
            id="buyer"
            bind:value={buyer} 
            placeholder="Enter buyer address" />
        </div>
        <div class="input-group">
          <label for="user">User (optional)</label>
          <input 
            type="text" 
            id="user"
            bind:value={user} 
            placeholder="Enter user address (seller or buyer)" />
        </div>
        <div class="input-group">
          <label for="minRound">Min Round (optional)</label>
          <input 
            type="number" 
            id="minRound"
            bind:value={minRound} 
            placeholder="Enter minimum round" />
        </div>
        <div class="input-group">
          <label for="maxRound">Max Round (optional)</label>
          <input 
            type="number" 
            id="maxRound"
            bind:value={maxRound} 
            placeholder="Enter maximum round" />
        </div>
        <div class="input-group">
          <label for="minPrice">Min Price (optional)</label>
          <input 
            type="number" 
            id="minPrice"
            bind:value={minPrice} 
            placeholder="Enter minimum price" />
        </div>
        <div class="input-group">
          <label for="maxPrice">Max Price (optional)</label>
          <input 
            type="number" 
            id="maxPrice"
            bind:value={maxPrice} 
            placeholder="Enter maximum price" />
        </div>
        <div class="input-group">
          <label for="minTimestamp">Min Timestamp (optional)</label>
          <input 
            type="number" 
            id="minTimestamp"
            bind:value={minTimestamp} 
            placeholder="Enter minimum timestamp" />
        </div>
        <div class="input-group">
          <label for="maxTimestamp">Max Timestamp (optional)</label>
          <input 
            type="number" 
            id="maxTimestamp"
            bind:value={maxTimestamp} 
            placeholder="Enter maximum timestamp" />
        </div>
        <div class="input-group">
          <label for="currency">Currency (optional)</label>
          <input 
            type="text" 
            id="currency"
            bind:value={currency} 
            placeholder="Enter currency ID (0 for native token)" />
        </div>
        <div class="input-group">
          <label for="sort">Sort Order (optional)</label>
          <select id="sort" bind:value={sort}>
            <option value="">Select</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="input-group">
          <label for="limit">Limit (optional)</label>
          <input 
            type="number" 
            id="limit"
            bind:value={limit} 
            placeholder="Enter result limit" />
        </div>
        <div class="input-group">
          <label for="nextToken">Next Token (optional)</label>
          <input 
            type="text" 
            id="nextToken"
            bind:value={nextToken} 
            placeholder="Enter pagination token" />
        </div>
      {:else if actualEndpoint === 'mpdeletes'}
        <div class="input-group">
          <label for="mpContractId">Marketplace Contract ID (optional)</label>
          <input 
            type="number" 
            id="mpContractId"
            bind:value={mpContractId} 
            placeholder="Enter marketplace contract ID" />
        </div>
        <div class="input-group">
          <label for="mpListingId">Listing ID (optional)</label>
          <input 
            type="text" 
            id="mpListingId"
            bind:value={mpListingId} 
            placeholder="Enter listing ID" />
        </div>
        <div class="input-group">
          <label for="collectionId">Collection ID (optional)</label>
          <input 
            type="text" 
            id="collectionId"
            bind:value={collectionId} 
            placeholder="Enter collection contract ID" />
        </div>
        <div class="input-group">
          <label for="tokenId">Token ID (optional)</label>
          <input 
            type="text" 
            id="tokenId"
            bind:value={tokenId} 
            placeholder="Enter token ID" />
        </div>
        <div class="input-group">
          <label for="owner">Owner (optional)</label>
          <input 
            type="text" 
            id="owner"
            bind:value={owner} 
            placeholder="Enter owner address" />
        </div>
        <div class="input-group">
          <label for="minRound">Min Round (optional)</label>
          <input 
            type="number" 
            id="minRound"
            bind:value={minRound} 
            placeholder="Enter minimum round" />
        </div>
        <div class="input-group">
          <label for="maxRound">Max Round (optional)</label>
          <input 
            type="number" 
            id="maxRound"
            bind:value={maxRound} 
            placeholder="Enter maximum round" />
        </div>
        <div class="input-group">
          <label for="minTimestamp">Min Timestamp (optional)</label>
          <input 
            type="number" 
            id="minTimestamp"
            bind:value={minTimestamp} 
            placeholder="Enter minimum timestamp" />
        </div>
        <div class="input-group">
          <label for="maxTimestamp">Max Timestamp (optional)</label>
          <input 
            type="number" 
            id="maxTimestamp"
            bind:value={maxTimestamp} 
            placeholder="Enter maximum timestamp" />
        </div>
        <div class="input-group">
          <label for="sort">Sort Order (optional)</label>
          <select id="sort" bind:value={sort}>
            <option value="">Select</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="input-group">
          <label for="limit">Limit (optional)</label>
          <input 
            type="number" 
            id="limit"
            bind:value={limit} 
            placeholder="Enter result limit" />
        </div>
        <div class="input-group">
          <label for="nextToken">Next Token (optional)</label>
          <input 
            type="text" 
            id="nextToken"
            bind:value={nextToken} 
            placeholder="Enter pagination token" />
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