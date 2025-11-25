import {
  fetchEventsClosingSoon,
  getMarketsInPriceRange,
} from "./fetch-closing-markets";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>polymoney</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 40px 20px;
      line-height: 1.6;
      min-height: 100vh;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 2rem;
      margin-bottom: 8px;
      color: #f0f6fc;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: #8b949e;
      font-size: 0.95rem;
      margin-bottom: 32px;
    }
    .controls {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
      background: #161b22;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #30363d;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .input-group label {
      font-size: 0.75rem;
      color: #8b949e;
      font-weight: 600;
    }
    input[type="number"] {
      padding: 8px 12px;
      border: 1px solid #30363d;
      background: #0d1117;
      color: #c9d1d9;
      font-family: inherit;
      font-size: 0.875rem;
      width: 100px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    input[type="number"]:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88,166,255,0.1);
    }
    button {
      padding: 8px 20px;
      background: #238636;
      border: none;
      color: #fff;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.875rem;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.15s;
      margin-top: 22px;
    }
    button:hover {
      background: #2ea043;
    }
    button:active { transform: scale(0.98); }
    .auto-refresh {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 22px;
      padding: 8px 12px;
      background: #161b22;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid #30363d;
    }
    .auto-refresh:hover { background: #1c2128; }
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .stats {
      margin: 24px 0;
      font-size: 0.875rem;
      color: #8b949e;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      padding: 16px 20px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-value {
      color: #f0f6fc;
      font-weight: 600;
    }
    .markets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 16px;
    }
    .market {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 20px;
      transition: all 0.2s;
    }
    .market:hover {
      border-color: #58a6ff;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
    }
    .market-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
    }
    .market-question {
      color: #f0f6fc;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.5;
      flex: 1;
    }
    .market-price {
      font-size: 1.5rem;
      color: #3fb950;
      font-weight: 600;
      white-space: nowrap;
    }
    .market-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 0.8125rem;
    }
    .market-outcome {
      color: #8b949e;
      padding: 4px 8px;
      background: #0d1117;
      border-radius: 4px;
      border: 1px solid #30363d;
    }
    .market-countdown {
      color: #f85149;
      font-weight: 500;
    }
    .market-countdown.safe {
      color: #8b949e;
    }
    .market-link {
      color: #58a6ff;
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .market-link:hover {
      text-decoration: underline;
    }
    .loading {
      padding: 60px 0;
      text-align: center;
      color: #8b949e;
      font-size: 1rem;
    }
    .empty {
      text-align: center;
      padding: 80px 20px;
      color: #8b949e;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
    }
    .empty-title {
      font-size: 1.2rem;
      margin-bottom: 8px;
      color: #f0f6fc;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Polymoney</h1>
    <div class="subtitle">High-probability markets closing soon</div>

    <div class="controls">
      <div class="input-group">
        <label>Min Probability</label>
        <input type="number" id="minPrice" value="95" placeholder="95">
      </div>
      <div class="input-group">
        <label>Max Probability</label>
        <input type="number" id="maxPrice" value="99" placeholder="99">
      </div>
      <div class="input-group">
        <label>Time Window (min)</label>
        <input type="number" id="maxMinutes" value="120" placeholder="120">
      </div>
      <button onclick="fetchMarkets()">Scan Markets</button>
      <label class="auto-refresh">
        <input type="checkbox" id="autoRefresh">
        Auto-refresh (30s)
      </label>
    </div>

    <div class="stats" id="stats"></div>
    <div class="markets-grid" id="markets"></div>
  </div>

  <script>
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
        const response = await fetch(\`/api/markets?minPrice=\${minPrice}&maxPrice=\${maxPrice}&maxMinutes=\${maxMinutes}\`);
        const data = await response.json();

        document.getElementById('stats').innerHTML =
          \`<div class="stat-item"><span class="stat-value">\${data.markets.length}</span> markets found</div>
           <div class="stat-item"><span class="stat-value">\${data.totalEvents}</span> events scanned</div>
           <div class="stat-item">Updated: \${new Date().toLocaleTimeString()}</div>\`;

        const marketsDiv = document.getElementById('markets');

        if (data.markets.length === 0) {
          marketsDiv.innerHTML = \`
            <div class="empty">
              <div class="empty-title">No markets found</div>
              <div>Try adjusting your filters</div>
            </div>
          \`;
          return;
        }

        marketsDiv.innerHTML = data.markets.map(m => \`
          <div class="market">
            <div class="market-header">
              <div class="market-question">\${m.question}</div>
              <div class="market-price">\${(m.leadingPrice * 100).toFixed(1)}%</div>
            </div>
            <div class="market-meta">
              <div class="market-outcome">\${m.leadingOutcome}</div>
              <div class="market-countdown" data-end-date="\${m.endDate}">\${formatTimeRemaining(m.endDate)}</div>
            </div>
            <a href="https://polymarket.com/event/\${m.slug}" target="_blank" class="market-link">
              View market →
            </a>
          </div>
        \`).join('');

        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdowns, 1000);
      } catch (error) {
        document.getElementById('markets').innerHTML = \`
          <div class="empty">
            <div class="empty-title">Error</div>
            <div>\${error.message}</div>
          </div>
        \`;
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
  </script>
</body>
</html>`,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    if (url.pathname === "/api/markets") {
      const minPrice = parseFloat(url.searchParams.get("minPrice") || "0.95");
      const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "0.99");
      const maxMinutes = parseInt(url.searchParams.get("maxMinutes") || "60");

      try {
        const events = await fetchEventsClosingSoon(maxMinutes);
        const markets = getMarketsInPriceRange(events, minPrice, maxPrice);

        return Response.json({
          totalEvents: events.length,
          markets: markets.map((m) => ({
            question: m.market.question,
            leadingOutcome: m.leadingOutcome,
            leadingPrice: m.leadingPrice,
            slug: m.market.slug,
            endDate: m.market.endDate,
          })),
        });
      } catch (error) {
        return Response.json(
          { error: (error as Error).message },
          { status: 500 },
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Polymoney server running at http://localhost:${server.port}`);
