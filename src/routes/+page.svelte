<script lang="ts">
  import { onMount } from 'svelte';
  import EndpointDetail from '$lib/components/EndpointDetail.svelte';
  import ApiPlayground from '$lib/components/ApiPlayground.svelte';
  import { endpoints } from '$lib/endpoints';

  let isDarkMode = false;
  let activeTab = 'docs';
  let selectedEndpoint: string | undefined = undefined;
  let searchQuery = '';
  let selectedCategory = 'all';
  
  // Using a Record to properly type the endpoint refs object
  let endpointRefs: Record<string, HTMLElement> = {};
  let activeEndpointId = '';
  let mainContentRef: HTMLElement | null = null;
  let expandedEndpoints: Record<string, boolean> = {};
  
  // Group endpoints by their path prefix (e.g., /arc200/*)
  const categories = [
    { id: 'all', name: 'All Endpoints' },
    ...Array.from(new Set(endpoints.map(e => e.path.split('/')[1])))
      .map(category => ({
        id: category,
        name: category.toUpperCase()
      }))
  ];

  // Group endpoints by category
  const endpointsByCategory = categories.reduce((acc, category) => {
    if (category.id === 'all') {
      acc[category.id] = endpoints;
    } else {
      acc[category.id] = endpoints.filter(endpoint => 
        endpoint.path.startsWith(`/${category.id}`)
      );
    }
    return acc;
  }, {} as Record<string, typeof endpoints>);

  $: filteredEndpoints = endpoints.filter(endpoint => {
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || 
                           endpoint.path.startsWith(`/${selectedCategory}`);
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
                         endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  function goToPlayground(endpoint: string) {
    activeTab = 'playground';
    selectedEndpoint = endpoint;
    // Update URL hash without refreshing page
    window.history.pushState({ tab: 'playground', endpoint }, '', `#playground/${endpoint}`);
  }

  function goToDocumentation(endpointId = '') {
    activeTab = 'docs';
    if (endpointId) {
      // Set this endpoint as expanded
      expandedEndpoints = { ...expandedEndpoints, [endpointId]: true };
      
      // Wait for DOM update then scroll to endpoint
      setTimeout(() => {
        const element = endpointRefs[endpointId];
        if (element && mainContentRef) {
          // Add scroll padding to account for header
          const headerHeight = 70; // Approximate header height plus buffer
          const elementRect = element.getBoundingClientRect();
          const targetPosition = elementRect.top + mainContentRef.scrollTop - headerHeight;
          
          mainContentRef.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          activeEndpointId = endpointId;
        }
      }, 10);
    }
    window.history.pushState({ tab: 'docs', endpoint: endpointId }, '', endpointId ? `#docs/${endpointId}` : '#docs');
  }

  function handlePopState(event: PopStateEvent) {
    // Handle browser back/forward buttons
    const state = event.state || {};
    if (state.tab) {
      activeTab = state.tab;
      if (state.tab === 'playground') {
        selectedEndpoint = state.endpoint;
      } else if (state.tab === 'docs' && state.endpoint) {
        // Set this endpoint as expanded
        expandedEndpoints = { ...expandedEndpoints, [state.endpoint]: true };
        
        setTimeout(() => {
          const element = endpointRefs[state.endpoint];
          if (element && mainContentRef) {
            // Add scroll padding to account for header
            const headerHeight = 70; // Approximate header height plus buffer
            const elementRect = element.getBoundingClientRect();
            const targetPosition = elementRect.top + mainContentRef.scrollTop - headerHeight;
            
            mainContentRef.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
            
            activeEndpointId = state.endpoint;
          }
        }, 10);
      }
    }
  }

  function setEndpointRef(endpoint: string, element: HTMLElement) {
    endpointRefs[endpoint] = element;
  }

  function checkActiveEndpoint() {
    // Find which endpoint is currently in view
    for (const [id, element] of Object.entries(endpointRefs)) {
      const rect = element.getBoundingClientRect();
      // Consider an element in view if its top is between 0 and 1/3 of viewport height
      if (rect.top >= 0 && rect.top <= window.innerHeight / 3) {
        if (activeEndpointId !== id) {
          activeEndpointId = id;
          // Update URL without scrolling
          const url = new URL(window.location.href);
          url.hash = `docs/${id}`;
          window.history.replaceState({ tab: 'docs', endpoint: id }, '', url.toString());
        }
        return;
      }
    }
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('theme');
    isDarkMode = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDarkMode);

    // Set initial state based on URL hash
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('playground/')) {
      activeTab = 'playground';
      selectedEndpoint = hash.split('/')[1];
      window.history.replaceState({ tab: 'playground', endpoint: selectedEndpoint }, '', `#playground/${selectedEndpoint}`);
    } else if (hash.startsWith('docs/')) {
      const endpointId = hash.split('/')[1];
      activeTab = 'docs';
      
      // Set this endpoint as expanded
      expandedEndpoints = { ...expandedEndpoints, [endpointId]: true };
      
      // Need to defer until endpoints are rendered
      setTimeout(() => {
        const element = endpointRefs[endpointId];
        if (element && mainContentRef) {
          // Add scroll padding to account for header
          const headerHeight = 70; // Approximate header height plus buffer
          const elementRect = element.getBoundingClientRect();
          const targetPosition = elementRect.top + mainContentRef.scrollTop - headerHeight;
          
          mainContentRef.scrollTo({
            top: targetPosition,
            behavior: 'auto'
          });
          
          activeEndpointId = endpointId;
        }
      }, 100);
      window.history.replaceState({ tab: 'docs', endpoint: endpointId }, '', `#docs/${endpointId}`);
    } else {
      // Initialize history state
      window.history.replaceState({ tab: 'docs' }, '', '#docs');
    }

    // Set up scroll event listener for endpoint highlighting
    const scrollListener = () => {
      if (activeTab === 'docs') {
        checkActiveEndpoint();
      }
    };

    if (mainContentRef) {
      mainContentRef.addEventListener('scroll', scrollListener);
    }
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      if (mainContentRef) {
        mainContentRef.removeEventListener('scroll', scrollListener);
      }
      window.removeEventListener('popstate', handlePopState);
    };
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
  <meta name="twitter:image" content="https://voi-mainnet-mimirapi.nftnavigator.xyz/android-chrome-512x512.png">
  <meta property="og:title" content="Mimir API - Voi Network">
  <meta property="og:description" content="A suite of APIs for the Voi Network">
  <meta property="og:url" content="https://voi-mainnet-mimirapi.nftnavigator.xyz">
  <meta property="og:image" content="https://voi-mainnet-mimirapi.nftnavigator.xyz/android-chrome-512x512.png">
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
            on:click={() => goToDocumentation()}>
            Documentation
          </button>
          <button 
            class:active={activeTab === 'playground'} 
            on:click={() => {
              activeTab = 'playground';
              window.history.pushState({ tab: 'playground' }, '', '#playground');
            }}>
            Try It
          </button>
        </nav>
      </div>
    </div>
  </header>

  <main class="container">
    {#if activeTab === 'docs'}
      <div class="docs-layout">
        <aside class="sidebar">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search endpoints..." 
              bind:value={searchQuery}
              aria-label="Search endpoints"
            />
          </div>
          
          <nav class="categories">
            {#each categories as category}
              {#if category.id !== 'all'}
                <div class="category-section">
                  <button 
                    class:active={selectedCategory === category.id || selectedCategory === 'all'}
                    on:click={() => selectedCategory = category.id}
                    class="category-button"
                  >
                    {category.name}
                  </button>
                  
                  {#if selectedCategory === 'all' || selectedCategory === category.id}
                    {@const filteredCategoryEndpoints = endpointsByCategory[category.id].filter(endpoint => {
                      return searchQuery === '' || 
                        endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
                    })}
                    
                    {#if filteredCategoryEndpoints.length > 0}
                      <ul class="endpoint-list">
                        {#each filteredCategoryEndpoints as endpoint}
                          <li>
                            <button 
                              class:active={activeEndpointId === endpoint.endpoint}
                              on:click={() => goToDocumentation(endpoint.endpoint)}
                              class="endpoint-button"
                            >
                              {endpoint.title}
                            </button>
                          </li>
                        {/each}
                      </ul>
                    {/if}
                  {/if}
                </div>
              {:else}
                <button 
                  class:active={selectedCategory === 'all'}
                  on:click={() => selectedCategory = 'all'}
                  class="category-button all-button"
                >
                  All Endpoints
                </button>
              {/if}
            {/each}
            
            {#if searchQuery && !categories.some(category => 
              category.id !== 'all' && endpointsByCategory[category.id].some(endpoint => 
                endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )}
              <div class="no-results-text">
                No endpoints match "{searchQuery}"
              </div>
            {/if}
          </nav>
          
          <div class="changes">
            <div class="version">
              <h3>Recent Changes</h3>
              <ul>
                <li>2024-04-08: Added ARC200 approvals API endpoint.</li>
                <li>2024-04-04: Added ARC200 tokens API endpoint.</li>
                <li>2024-04-04: Added ARC200 token transfers API endpoint.</li>
                <li>2024-04-04: Initial release with ARC200 token balances API.</li>
              </ul>
            </div>
          </div>
        </aside>
        
        <div class="docs-content" bind:this={mainContentRef}>
          <section class="intro">
            <h2>Quick Start</h2>
            <p>Mimir API provides a suite of services for the Voi Network, helping developers build applications with easy access to chain data.</p>
          </section>
          
          {#if filteredEndpoints.length > 0}
            <div class="endpoints">
              {#each filteredEndpoints as endpoint}
                <div 
                  id={endpoint.endpoint} 
                  bind:this={endpointRefs[endpoint.endpoint]}
                >
                  <EndpointDetail 
                    {endpoint} 
                    expanded={!!expandedEndpoints[endpoint.endpoint]}
                    on:try={(e) => goToPlayground(e.detail)}
                    on:expand={(e) => {
                      const { endpoint: endpointId, expanded } = e.detail;
                      if (expanded) {
                        expandedEndpoints = { ...expandedEndpoints, [endpointId]: true };
                      } else {
                        const { [endpointId]: _, ...rest } = expandedEndpoints;
                        expandedEndpoints = rest;
                      }
                    }} 
                  />
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-results">
              <p>No endpoints found matching your criteria. Try adjusting your search or category.</p>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="playground-container">
        <div class="back-to-docs">
          <button on:click={() => goToDocumentation()}>
            ← Back to documentation
          </button>
        </div>
        <ApiPlayground {selectedEndpoint} />
      </div>
    {/if}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    overflow: hidden;
  }
  :global(:root) {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border-color: #e5e5e5;
    --code-bg: #f1f3f5;
    --accent-color: #6366F1;
    --bg-hover: rgba(0, 0, 0, 0.05);
    --sidebar-width: 280px;
  }

  :global(.dark-theme) {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --text-primary: #ffffff;
    --text-secondary: #a0aec0;
    --border-color: #404040;
    --code-bg: #2d2d2d;
    --bg-hover: rgba(255, 255, 255, 0.05);
  }

  .app {
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  header {
    background: var(--bg-secondary);
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    box-sizing: border-box;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    flex-shrink: 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    white-space: nowrap;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }
  
  .logo-container h1 {
    margin: 0;
    font-size: 1.5rem;
    white-space: nowrap;
  }

  .logo {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  nav button {
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 4px;
    white-space: nowrap;
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .docs-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .sidebar {
    width: var(--sidebar-width);
    flex-shrink: 0;
    overflow-y: auto;
    padding: 1.5rem 1rem 1.5rem 0;
    border-right: 1px solid var(--border-color);
    height: 100%;
  }

  .docs-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1.5rem 1.5rem 2rem;
    height: 100%;
    scroll-behavior: smooth;
    scroll-padding-top: 70px; /* Same as the headerHeight in JS */
  }

  .search-box {
    margin-bottom: 1.5rem;
  }

  .search-box input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    box-sizing: border-box;
  }

  .categories {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-button {
    text-align: left;
    padding: 0.75rem;
    border: none;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    font-weight: 500;
  }

  .category-button:hover {
    background: var(--bg-hover);
  }

  .category-button.active {
    background: var(--accent-color);
    color: white;
  }

  .all-button {
    margin-bottom: 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    font-weight: 600;
  }
  
  .all-button.active {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .endpoint-list {
    list-style: none;
    padding: 0 0 0 1rem;
    margin: 0 0 0.5rem 0;
  }

  .endpoint-list li {
    margin-bottom: 0.25rem;
  }

  .endpoint-button {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.75rem;
    border: none;
    background: none;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .endpoint-button:hover {
    background-color: var(--bg-hover);
  }

  .endpoint-button.active {
    background-color: var(--bg-hover);
    color: var(--accent-color);
    font-weight: 500;
    border-left: 3px solid var(--accent-color);
    padding-left: calc(0.75rem - 3px);
  }

  .endpoints {
    display: grid;
    gap: 2rem;
    margin: 2rem 0;
  }

  .intro {
    margin-bottom: 2rem;
  }

  .no-results {
    padding: 2rem;
    text-align: center;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin: 2rem 0;
  }

  .changes {
    margin-top: 2rem;
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
    font-size: 1rem;
  }

  .version ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.9rem;
  }

  .version li {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  .playground-container {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .back-to-docs {
    margin-bottom: 1.5rem;
  }

  .back-to-docs button {
    background: none;
    border: none;
    color: var(--accent-color);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem 0;
  }

  .no-results-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-align: center;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: 4px;
    margin-top: 0.5rem;
  }

  /* Add space at the top of each endpoint element */
  .endpoints > div {
    padding-top: 1rem;
    margin-top: -1rem;
  }
  
  /* Add extra padding to the first endpoint element */
  .endpoints > div:first-child {
    padding-top: 0;
    margin-top: 0;
  }

  @media (max-width: 768px) {
    :global(body) {
      height: auto;
      overflow: auto;
    }
    
    .app {
      height: auto;
      min-height: 100vh;
      overflow: auto;
    }
    
    .header-content {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: space-between;
    }
    
    .logo-container h1 {
      font-size: 1.2rem;
    }

    nav button {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }

    .container {
      padding: 0;
      overflow: auto;
    }
    
    .docs-layout {
      flex-direction: column;
      overflow: auto;
      height: auto;
    }
    
    .sidebar {
      width: 100%;
      padding: 1.5rem;
      border-right: none;
      border-bottom: 1px solid var(--border-color);
      overflow: visible;
      height: auto;
    }
    
    .docs-content {
      padding: 1.5rem;
      overflow: visible;
      height: auto;
    }
    
    .playground-container {
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>

