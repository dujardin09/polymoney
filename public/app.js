let autoRefreshInterval = null;
let countdownInterval = null;

function formatTimeRemaining(endDateIso) {
  if (!endDateIso) return 'Unknown';

  const now = new Date();
  const end = new Date(endDateIso);
  const diff = end - now;

  if (diff <= 0) return 'Closed';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return hours + 'h ' + minutes + 'm ' + seconds + 's';
  }
  if (minutes > 0) {
    return minutes + 'm ' + seconds + 's';
  }
  return seconds + 's';
}

function updateCountdowns() {
  document.querySelectorAll('[data-end-date]').forEach(el => {
    const endDate = el.getAttribute('data-end-date');
    el.textContent = formatTimeRemaining(endDate);
  });
}

async function fetchMarkets() {
  const minPrice = parseFloat(document.getElementById('minPrice').value) / 100;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) / 100;
  const maxMinutes = parseInt(document.getElementById('maxMinutes').value);

  document.getElementById('markets').innerHTML = '<div class="loading">Scanning markets...</div>';

  try {
    const response = await fetch(`/api/markets?minPrice=${minPrice}&maxPrice=${maxPrice}&maxMinutes=${maxMinutes}`);
    const data = await response.json();

    document.getElementById('stats').innerHTML =
      `<div class="stat-item"><span class="stat-value">${data.markets.length}</span> markets found</div>
       <div class="stat-item"><span class="stat-value">${data.totalEvents}</span> events scanned</div>
       <div class="stat-item">Updated: ${new Date().toLocaleTimeString()}</div>`;

    const marketsDiv = document.getElementById('markets');

    if (data.markets.length === 0) {
      marketsDiv.innerHTML = `
        <div class="empty">
          <div class="empty-title">No markets found</div>
          <div>Try adjusting your filters</div>
        </div>
      `;
      return;
    }

    marketsDiv.innerHTML = data.markets.map(m => `
      <div class="market">
        <div class="market-header">
          <div class="market-question">${m.question}</div>
          <div class="market-price">${(m.leadingPrice * 100).toFixed(1)}%</div>
        </div>
        <div class="market-meta">
          <div class="market-outcome">${m.leadingOutcome}</div>
          <div class="market-countdown" data-end-date="${m.endDate}">${formatTimeRemaining(m.endDate)}</div>
        </div>
        <a href="https://polymarket.com/event/${m.slug}" target="_blank" class="market-link">
          View market →
        </a>
      </div>
    `).join('');

    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdowns, 1000);
  } catch (error) {
    document.getElementById('markets').innerHTML = `
      <div class="empty">
        <div class="empty-title">Error</div>
        <div>${error.message}</div>
      </div>
    `;
  }
}

document.getElementById('autoRefresh').addEventListener('change', (e) => {
  if (e.target.checked) {
    fetchMarkets();
    autoRefreshInterval = setInterval(fetchMarkets, 30000);
  } else {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
});

fetchMarkets();
