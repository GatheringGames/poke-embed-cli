// == Pokemon Embed Script ==
(async () => {
  const SUPABASE_URL = "https://goptnxkxuligthfvefes.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcHRueGt4dWxpZ3RoZnZlZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY3MjcsImV4cCI6MjA1ODk5MjcyN30.4qh8BWbnwsrfbPHg7PfPG2B-0aTKpgipOATLqHq9MN0";
  const EXCHANGE_RATE_API = "https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP";

  const exchangeRates = await fetch(EXCHANGE_RATE_API)
    .then(r => r.json())
    .then(data => ({
      eur: data.rates.EUR,
      gbp: data.rates.GBP
    }))
    .catch(() => ({ eur: 0.92, gbp: 0.78 }));

  const chartJsScript = document.createElement("script");
  chartJsScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
  document.head.appendChild(chartJsScript);
  chartJsScript.onload = () => initEmbeds();

  const style = document.createElement("style");
  style.textContent = `
    .poke-embed {
      background: #394042;
      color: white;
      border-radius: 8px;
      padding: 1em;
      margin: 1em 0;
      display: flex;
      gap: 1em;
      border: 2px solid #5c696d;
      align-items: center;
    }
    .poke-card-image img {
      width: 250px;
      border-radius: 4px;
      cursor: zoom-in;
      display: block;
      margin: 0 auto;
    }
    .poke-info {
      flex: 1;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .poke-info h3 {
      margin-top: 0;
      color: white;
    }
    .poke-rarity {
      margin-bottom: 0.5em;
      color: #ccc;
    }
    .poke-price-label {
      font-weight: bold;
      margin-top: 0.5em;
    }
    .poke-currency-buttons, .poke-range-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5em;
      margin-top: 0.5em;
    }
    .poke-currency-buttons button, .poke-range-buttons button {
      padding: 4px 8px;
      cursor: pointer;
      border: none;
      background: #ccc;
      border-radius: 4px;
    }
    .poke-currency-buttons button.active, .poke-range-buttons button.active {
      background-color: #d8232f;
      color: white;
    }
    canvas.poke-price-chart {
      max-width: 100%;
      margin: 1em auto 0 auto;
      background: white;
      border-radius: 4px;
      display: block;
    }
    .poke-price-note {
      font-size: 0.8em;
      margin-top: 4px;
      color: #ccc;
      text-align: center;
    }
    @media (max-width: 768px) {
      .poke-embed {
        flex-direction: column;
        align-items: center;
      }
    }
  `;
  document.head.appendChild(style);

  async function initEmbeds() {
    const regex = /embed::\[\[(.+?)\s+\((.+?)\)\]\]/g;
    const paragraphs = Array.from(document.querySelectorAll("p"));

    for (const p of paragraphs) {
      const matches = [...p.innerHTML.matchAll(regex)];
      if (!matches.length) continue;

      for (const match of matches) {
        const [fullMatch, name, id] = match;
        const [set, number] = id.split("-");

        const rarity = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`)
          .then(res => res.json())
          .then(json => json?.data?.rarity || "")
          .catch(() => "");

        const container = document.createElement("div");
        container.className = "poke-embed";
        container.innerHTML = `
          <div class="poke-card-image">
            <img src="https://images.pokemontcg.io/${set}/${number}.png" alt="${name}" data-hires="https://images.pokemontcg.io/${set}/${number}_hires.png" />
          </div>
          <div class="poke-info">
            <h3>${name}</h3>
            <div class="poke-rarity">${rarity}</div>
            <div class="poke-price-label">Current Market Price: <span class="poke-current-price">Loading...</span></div>
            <div class="poke-currency-buttons">
              <button class="active" data-currency="usd">USD</button>
              <button data-currency="eur">EUR</button>
              <button data-currency="gbp">GBP</button>
            </div>
            <canvas class="poke-price-chart"></canvas>
            <div class="poke-range-buttons">
              <button class="active" data-range="7">7d</button>
              <button data-range="30">30d</button>
              <button data-range="180">6mo</button>
              <button data-range="365">1yr</button>
            </div>
            <div class="poke-price-note">Prices provided by TCGplayer</div>
          </div>
        `;

        p.replaceWith(container);
        setupEmbed(container, id);
      }
    }
  }

  async function setupEmbed(container, id) {
    const ANON_KEY = SUPABASE_KEY;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_card_prices?select=date,price_usd&card_id=eq.${id}&order=date.asc`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    if (!res.ok) {
      console.error("Price data fetch failed", await res.text());
      return;
    }

    const data = await res.json();
    const ctx = container.querySelector("canvas").getContext("2d");
    const prices = data.map(d => d.price_usd);
    const dates = data.map(d => d.date);
    const priceLabel = container.querySelector(".poke-current-price");
    const currencyButtons = container.querySelectorAll(".poke-currency-buttons button");
    let currentCurrency = "usd";

    const getConvertedPrices = (currency) => {
      if (currency === "eur") return prices.map(p => p * exchangeRates.eur);
      if (currency === "gbp") return prices.map(p => p * exchangeRates.gbp);
      return prices;
    };

    const getSymbol = (currency) => {
      if (currency === "eur") return "€";
      if (currency === "gbp") return "£";
      return "$";
    };

    const aggregate = (data, intervalDays) => {
      const result = [];
      for (let i = 0; i < data.length; i += intervalDays) {
        const slice = data.slice(i, i + intervalDays);
        const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
        result.push(avg);
      }
      return result;
    };

    const aggregateDates = (dates, intervalDays) => {
      const result = [];
      for (let i = 0; i < dates.length; i += intervalDays) {
        result.push(dates[i]);
      }
      return result;
    };

    let chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates.slice(-7),
        datasets: [{
          label: "Price (USD)",
          data: prices.slice(-7),
          borderColor: "#d8232f",
          backgroundColor: "rgba(216,35,47,0.2)",
          fill: true,
        }]
      }
    });

    priceLabel.textContent = `$${prices[prices.length - 1]}`;

    container.querySelectorAll(".poke-range-buttons button").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelector(".poke-range-buttons .active").classList.remove("active");
        btn.classList.add("active");
        const range = parseInt(btn.dataset.range);
        let converted = getConvertedPrices(currentCurrency);
        let shownPrices, shownDates;

        if (range === 180) {
          shownPrices = aggregate(converted.slice(-180), 14);
          shownDates = aggregateDates(dates.slice(-180), 14);
        } else if (range === 365) {
          shownPrices = aggregate(converted.slice(-365), 30);
          shownDates = aggregateDates(dates.slice(-365), 30);
        } else {
          shownPrices = converted.slice(-range);
          shownDates = dates.slice(-range);
        }

        chart.data.labels = shownDates;
        chart.data.datasets[0].data = shownPrices;
        chart.update();
      });
    });

    currencyButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelector(".poke-currency-buttons .active").classList.remove("active");
        btn.classList.add("active");
        currentCurrency = btn.dataset.currency;
        const converted = getConvertedPrices(currentCurrency);
        const range = parseInt(container.querySelector(".poke-range-buttons .active").dataset.range);

        let shownPrices, shownDates;
        if (range === 180) {
          shownPrices = aggregate(converted.slice(-180), 14);
          shownDates = aggregateDates(dates.slice(-180), 14);
        } else if (range === 365) {
          shownPrices = aggregate(converted.slice(-365), 30);
          shownDates = aggregateDates(dates.slice(-365), 30);
        } else {
          shownPrices = converted.slice(-range);
          shownDates = dates.slice(-range);
        }

        chart.data.labels = shownDates;
        chart.data.datasets[0].data = shownPrices;
        chart.update();

        priceLabel.textContent = `${getSymbol(currentCurrency)}${converted[converted.length - 1].toFixed(2)}`;
      });
    });

    container.querySelector("img").addEventListener("click", e => {
      window.open(e.target.dataset.hires, "_blank");
    });
  }
})();
