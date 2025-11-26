let autoRefreshInterval = null;

function formatDate(dateIso) {
  if (!dateIso) return 'Unknown';
  const date = new Date(dateIso);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function parseOutcomes(outcomes) {
  if (!outcomes) return [];
  if (typeof outcomes === 'string') {
    try {
      return JSON.parse(outcomes);
    } catch (e) {
      return [];
    }
  }
  return outcomes;
}

function parsePrices(prices) {
  if (!prices) return [];
  if (typeof prices === 'string') {
    try {
      return JSON.parse(prices);
    } catch (e) {
      return [];
    }
  }
  return prices;
}

function formatPrices(market) {
  const outcomes = parseOutcomes(market.outcomes);
  const prices = parsePrices(market.outcomePrices);
  
  if (!outcomes.length || !prices.length) return '';
  
  return outcomes.map((outcome, i) => {
    const price = prices[i];
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const percentage = (numPrice * 100).toFixed(1);
    return `<div class="outcome-price">
      <span class="outcome-name">${outcome}</span>
      <span class="price-value">${percentage}%</span>
    </div>`;
  }).join('');
}

async function fetchRecentMarkets() {
  const maxMinutes = parseInt(document.getElementById('maxMinutes').value);
  document.getElementById('events').innerHTML = '<div class="loading">Loading recent markets...</div>';

  try {
    const response = await fetch(`/api/recent-markets?maxMinutes=${maxMinutes}`);
    const data = await response.json();

    document.getElementById('stats').innerHTML =
      `<div class="stat-item"><span class="stat-value">${data.totalEvents}</span> events created</div>
       <div class="stat-item">Updated: ${new Date().toLocaleTimeString()}</div>`;

    const eventsDiv = document.getElementById('events');

    if (data.events.length === 0) {
      eventsDiv.innerHTML = `
        <div class="empty">
          <div class="empty-title">No recent events</div>
          <div>No new markets created in the last hour</div>
        </div>
      `;
      return;
    }

    eventsDiv.innerHTML = data.events.map(event => `
      <div class="event">
        <div class="event-header">
          <div class="event-title">${event.title}</div>
          <div class="event-date">${formatDate(event.startDate)}</div>
        </div>
        <div class="event-markets">
          ${event.markets.map(market => `
            <div class="market-item">
              <div class="market-info">
                <div class="market-question">${market.question}</div>
                <div class="market-prices">
                  ${formatPrices(market)}
                </div>
              </div>
              <a href="https://polymarket.com/event/${market.slug}" target="_blank" class="market-link">
                View →
              </a>
            </div>
          `).join('')}
        </div>
        <a href="https://polymarket.com/event/${event.slug}" target="_blank" class="event-link">
          View event →
        </a>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('events').innerHTML = `
      <div class="empty">
        <div class="empty-title">Error</div>
        <div>${error.message}</div>
      </div>
    `;
  }
}

document.getElementById('autoRefresh').addEventListener('change', (e) => {
  if (e.target.checked) {
    fetchRecentMarkets();
    autoRefreshInterval = setInterval(fetchRecentMarkets, 30000);
  } else {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
});

fetchRecentMarkets();
