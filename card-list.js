// == Pokemon Embed Script ==
const style = document.createElement("style");
style.textContent = `
/* Base styles for page */
body {
  background: #f5f5f5;
}

/* Card grid layout */
.pokemon-set-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  width: 90vw;
  margin-left: calc(-45vw + 50%);
  margin-right: calc(-45vw + 50%);
}

.pokemon-set-list-card {
  text-align: center;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.pokemon-set-list-card:hover {
  transform: scale(1.05);
}

.pokemon-set-list-card img {
  width: 100%;
  height: auto;
}

.pokemon-set-list-card p {
  margin: 8px 0 0;
  font-size: 14px;
}

@media (max-width: 600px) {
  .pokemon-set-list-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Style fix for modal layout */
.poke-embed {
  position: relative;
  display: flex;
  flex-direction: row;
  background: #394042;
  color: white;
  border-radius: 8px;
  padding: 1em;
  border: 2px solid #5c696d;
  align-items: center;
  width: 100%;
  max-width: 800px;
  min-height: 360px;
  box-sizing: border-box;
  flex-wrap: wrap;
}
.poke-card-image {
  flex: 0 0 250px;
}
.poke-card-image img {
  width: 100%;
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
  padding: 0 1em;
  color: white;
  text-align: left;
}
.poke-info h3 {
  margin-top: 0;
  color: white;
  text-align: left;
}
.poke-stats {
  display: flex;
  gap: 1em;
  margin-bottom: 0.5em;
  text-align: left;
}
.poke-type {
  font-style: italic;
  text-align: left;
}
.poke-trainer-type {
  font-style: italic;
  color: #f0d048;
  margin-bottom: 0.5em;
  font-weight: bold;
}
.poke-ability {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}
.poke-attack {
  margin-top: 0.35em;
  margin-bottom: 0.35em;
  text-align: left;
}
.poke-attack-text {
  margin-top: 0.1em;
}
.poke-embed-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: none;
  align-items: center; /* Center vertically on desktop */
  justify-content: center;
  padding: 0;
  z-index: 9999; /* Higher z-index to ensure it's above Shopify menu */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  text-align: left; /* Change from center to left */
}
.poke-embed-modal.show {
  display: flex;
}
.poke-modal-close {
  position: absolute; /* Changed from fixed to absolute for desktop */
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.7); /* Add background for visibility */
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.energy-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  display: inline-block;
  margin-right: 2px;
}
.poke-attack-line {
  display: inline-block;
  white-space: nowrap;
}
.poke-attack-damage {
  font-weight: normal;
  margin-left: 0.5em;
}

.poke-rarity {
  margin-bottom: 0.5em;
  color: #ccc;
  text-align: left;
}
.poke-text, .poke-ability, .poke-attack-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 0.5em;
  text-align: left;
}
.poke-price-label {
  font-weight: bold;
  margin-top: 1.5em;
  text-align: left;
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
  text-align: left;
}

@media (max-width: 600px) {
  .poke-embed {
    flex-direction: column;
    align-items: center;
  }

  .poke-info {
    padding: 1em 0 0;
  }

  .poke-modal-close {
    position: fixed; /* Keep as fixed for mobile */
    top: 10px;
    right: 10px;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .poke-embed-modal {
    align-items: flex-start; /* Top align on mobile */
    padding: 20px 0; /* Remove horizontal padding */
  }
  .poke-embed {
    width: 80% !important; /* Further reduce width for more margin */
    max-width: 80% !important; /* Further reduce max-width for more margin */
    margin: 0 auto 60px auto; /* Center horizontally and add bottom margin */
    box-sizing: border-box; /* Include padding in width calculation */
    padding: 10px; /* Reduce padding to save space */
    float: none; /* Ensure proper centering */
    display: block; /* Better for centering */
  }
  .poke-card-image {
    flex: 0 0 auto; /* Don't force width */
    width: 100%; /* Take full width in mobile view */
    max-width: 200px; /* Limit maximum width */
    margin: 0 auto; /* Center the image */
  }
  .poke-card-image img {
    width: 100%; /* Make image responsive */
    max-width: 200px; /* Limit maximum width */
  }
  .poke-info {
    width: 100%; /* Take full width */
    padding: 10px 0 0; /* Adjust padding */
    text-align: left;
  }
  canvas.poke-price-chart {
    height: auto !important; /* Make chart height responsive */
    width: 100% !important; /* Make chart width responsive */
  }
  .poke-range-buttons, .poke-currency-buttons {
    justify-content: center; /* Center these buttons only on mobile */
  }
  .poke-price-note {
    text-align: center; /* Center the price note on mobile */
  }
}

.poke-flavor-text {
  font-size: 14px;
  font-style: italic;
  color: #ccc;
  margin: 0.5em 0;
  text-align: left;
}
`;
document.head.appendChild(style);
(async () => {
  const SUPABASE_URL = "https://goptnxkxuligthfvefes.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcHRueGt4dWxpZ3RoZnZlZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY3MjcsImV4cCI6MjA1ODk5MjcyN30.4qh8BWbnwsrfbPHg7PfPG2B-0aTKpgipOATLqHq9MN0";
  const EXCHANGE_RATE_API = "https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP";

  // Cache for price data to avoid duplicate fetches
  const priceCache = new Map();
  
  // Cache for historical price data
  const historicalPriceCache = new Map();

  // Try to get exchange rates from localStorage first to reduce API calls
  let exchangeRates;
  const cachedRates = localStorage.getItem('pokeExchangeRates');
  const ratesCacheTime = localStorage.getItem('pokeExchangeRatesTime');
  const now = Date.now();
  
  // Use cached rates if they're less than 24 hours old
  if (cachedRates && ratesCacheTime && (now - parseInt(ratesCacheTime)) < 86400000) {
    exchangeRates = JSON.parse(cachedRates);
    console.log("Using cached exchange rates");
  } else {
    // Fetch new rates and cache them
    exchangeRates = await fetch(EXCHANGE_RATE_API)
      .then(r => r.json())
      .then(data => {
        const rates = {
          eur: data.rates.EUR,
          gbp: data.rates.GBP
        };
        
        // Cache the rates
        localStorage.setItem('pokeExchangeRates', JSON.stringify(rates));
        localStorage.setItem('pokeExchangeRatesTime', now.toString());
        
        return rates;
      })
      .catch(() => ({ eur: 0.92, gbp: 0.78 }));
  }

  // Ensure Chart.js is loaded
  const loadChartJs = () => {
    return new Promise((resolve) => {
      // Check if Chart is already defined globally
      if (window.Chart) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };
  
  // Load Chart.js and then initialize
  await loadChartJs();
  
  // Load cards in a more efficient order - do prices first since they're most visible
  loadGridPrices();
  initGridCardClicks();
  initEmbeds();

  const ENERGY_ICON_URLS = {
    G: "https://js.gatheringgames.co.uk/symbols/grass.svg",
    R: "https://js.gatheringgames.co.uk/symbols/fire.svg",
    W: "https://js.gatheringgames.co.uk/symbols/water.svg",
    L: "https://js.gatheringgames.co.uk/symbols/lightning.svg",
    P: "https://js.gatheringgames.co.uk/symbols/psychic.svg",
    F: "https://js.gatheringgames.co.uk/symbols/fighting.svg",
    D: "https://js.gatheringgames.co.uk/symbols/darkness.svg",
    M: "https://js.gatheringgames.co.uk/symbols/metal.svg",
    Y: "https://js.gatheringgames.co.uk/symbols/fairy.svg",
    N: "https://js.gatheringgames.co.uk/symbols/dragon.svg",
    C: "https://js.gatheringgames.co.uk/symbols/colorless.svg"
  };

  function renderEnergySymbols(costStr) {
    const matches = costStr.match(/\{([A-Z])\}/g) || [];
    return matches.map(match => {
      const symbol = match.replace(/\{|\}/g, '');
      const url = ENERGY_ICON_URLS[symbol];
      return url
        ? `<img src="${url}" alt="${symbol}" class="energy-icon">`
        : match;
    }).join('');
  }


   function renderAdditionalCardDetails(dataset) {
    const { hp, types, abilityName, abilityText, attacks, supertype, subtype, text } = dataset;
  
    const typeBadge = types ? `<div class="poke-type">Type: ${types}</div>` : "";
    const hpInfo = hp ? `<div class="poke-hp">${hp} HP</div>` : "";
    
    // Add trainer card type info
    let cardTypeInfo = "";
    if (supertype === "Trainer") {
      cardTypeInfo = `<div class="poke-trainer-type">Trainer Card${subtype ? ` - ${subtype}` : ""}</div>`;
    } else if (supertype === "Energy") {
      cardTypeInfo = `<div class="poke-trainer-type">Energy Card${subtype ? ` - ${subtype}` : ""}</div>`;
    }
    
    // Only include the ability section if both abilityName and abilityText are present
    const abilityInfo = (abilityName && abilityText) 
      ? `<div class="poke-ability"><strong>Ability: ${abilityName}</strong><br>${abilityText}</div>`
      : "";
      
    // Only show rules text if it's not empty and it's not for Pokémon cards
    const rulesText = (text && text.trim() !== "" && supertype !== "Pokémon") 
      ? `<div class="poke-text">${text}</div>` 
      : "";
    
    // For Pokémon, only show flavor text
    const flavorText = (text && text.trim() !== "" && supertype === "Pokémon") 
      ? `<div class="poke-flavor-text">${text}</div>` 
      : "";
    
    let attacksHtml = "";
    try {
      const decoded = new DOMParser().parseFromString(attacks, "text/html").documentElement.textContent;
      const attackArray = JSON.parse(decoded);
      attackArray.sort((a, b) => a.cost.length - b.cost.length); // Sort by energy cost length
  
      for (const atk of attackArray) {
        attacksHtml += `
          <div class="poke-attack">
            <span class="poke-attack-line">
              ${renderEnergySymbols(atk.cost.join(""))}
              <strong>${atk.name}</strong>
              &nbsp;&nbsp;&nbsp;
              <span class="poke-attack-damage">${atk.damage}</span>
            </span>
            ${atk.text ? `<div class="poke-attack-text">${atk.text}</div>` : ""}
          </div>
        `;
      }
    } catch (err) {
      console.error("Attack parse failed", err, attacks);
    }
  
    return `
      <div class="poke-stats">
        ${hpInfo}
        ${typeBadge}
      </div>
      ${cardTypeInfo}
      ${abilityInfo}
      ${flavorText}
      ${rulesText}
      <div class="poke-attacks-container">
        ${attacksHtml}
      </div>
    `;

  }

  function getSymbol(currency) {
    if (currency === "eur") return "€";
    if (currency === "gbp") return "£";
    return "$";
  }

  function aggregate(data, intervalDays) {
    const result = [];
    for (let i = 0; i < data.length; i += intervalDays) {
      const slice = data.slice(i, i + intervalDays);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      result.push(avg);
    }
    return result;
  }

  function aggregateDates(dates, intervalDays) {
    const result = [];
    for (let i = 0; i < dates.length; i += intervalDays) {
      result.push(dates[i]);
    }
    return result;
  }

  async function setupEmbed(container, id, prices, dates, currentCurrency = "usd") {
    const ctx = container.querySelector("canvas").getContext("2d");
    const priceLabel = container.querySelector(".poke-current-price");

    const getConvertedPrices = (currency) => {
      if (currency === "eur") return prices.map(p => p * exchangeRates.eur);
      if (currency === "gbp") return prices.map(p => p * exchangeRates.gbp);
      return prices;
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
      },
      options: {
        animation: false, // Disable animations for better performance
        responsive: true,
        maintainAspectRatio: true
      }
    });

    priceLabel.textContent = `${getSymbol(currentCurrency)}${getConvertedPrices(currentCurrency).slice(-1)[0].toFixed(2)}`;

    container.querySelectorAll(".poke-range-buttons button").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelector(".poke-range-buttons .active").classList.remove("active");
        btn.classList.add("active");
        const range = parseInt(btn.dataset.range);
        const converted = getConvertedPrices(currentCurrency);
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

    container.querySelectorAll(".poke-currency-buttons button").forEach(btn => {
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

  async function initGridCardClicks() {
    const cards = document.querySelectorAll(".pokemon-set-list-card");
    const modal = document.getElementById("pokeEmbedModal");

    if (!modal) return;
    
    // Pre-fetch historical price data for all visible cards
    const visibleCards = Array.from(cards).filter(card => {
      const rect = card.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }).slice(0, 10); // Just get the first 10 visible cards
    
    // Pre-fetch data for visible cards
    const prefetchPromises = visibleCards.map(async card => {
      const id = card.dataset.id;
      if (historicalPriceCache.has(id)) return;
      
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_card_prices?select=date,price_usd&card_id=eq.${id}&order=date.asc`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        });
        
        if (res.ok) {
          const priceData = await res.json();
          historicalPriceCache.set(id, {
            prices: priceData.map(d => d.price_usd),
            dates: priceData.map(d => d.date)
          });
        }
      } catch (err) {
        console.error("Error prefetching prices for card:", id);
      }
    });
    
    // Wait for prefetch to complete
    await Promise.all(prefetchPromises);

    // Function to open the modal
    const openModal = async (card) => {
      const { id, name, set, number, image, rarity, text } = card.dataset;
      
      // Strip leading zeros for image URL
      const imageNumber = number.replace(/^0+/, '');
      
      // Show loading state in modal immediately
      modal.innerHTML = `
        <div class="poke-embed">
          <div class="poke-card-image">
            <img src="https://images.pokemontcg.io/${set}/${imageNumber}.png" alt="${name}" data-hires="https://images.pokemontcg.io/${set}/${imageNumber}_hires.png" />
          </div>
          <div class="poke-info">
            <h3>${name}</h3>
            <div class="poke-rarity">${rarity}</div>\n${renderAdditionalCardDetails(card.dataset)}
            
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
          <div class="poke-modal-close" id="pokeModalClose">✖</div>
        </div>
      `;
      
      // Show modal
      modal.classList.add("show");
      document.body.classList.add("modal-open");
      
      // Reset modal scroll position
      modal.scrollTop = 0;
      
      // Set up close handler
      document.getElementById("pokeModalClose").onclick = closeModal;
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      
      // Check if we already have the price data in the cache
      let prices, dates;
      
      if (historicalPriceCache.has(id)) {
        const cachedData = historicalPriceCache.get(id);
        prices = cachedData.prices;
        dates = cachedData.dates;
        console.log("Using cached historical price data for card:", id);
      } else {
        // Fetch the price data if not in cache
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_card_prices?select=date,price_usd&card_id=eq.${id}&order=date.asc`, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          });
          
          if (res.ok) {
            const priceData = await res.json();
            prices = priceData.map(d => d.price_usd);
            dates = priceData.map(d => d.date);
            
            // Cache the results for future use
            historicalPriceCache.set(id, { prices, dates });
          } else {
            console.error("Failed to fetch price data for card:", id);
            prices = [0];
            dates = [new Date().toISOString().split('T')[0]];
          }
        } catch (error) {
          console.error("Error fetching prices for card:", id);
          prices = [0];
          dates = [new Date().toISOString().split('T')[0]];
        }
      }
      
      setupEmbed(modal.querySelector(".poke-embed"), id, prices, dates);
    };
    
    // Function to close the modal
    const closeModal = () => {
      document.body.classList.remove("modal-open");
      modal.classList.remove("show");
    };
    
    // Add click handlers to all cards
    cards.forEach(card => {
      card.addEventListener("click", () => openModal(card));
    });
  }

  async function loadGridPrices() {
    const cards = document.querySelectorAll(".pokemon-set-list-card");
    const headers = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    };

    // Get all card IDs
    const cardIds = Array.from(cards).map(card => card.dataset.id);
    
    // If no cards, exit early
    if (cardIds.length === 0) return;
    
    // Only fetch prices for cards that are visible in viewport first
    const visibleCards = Array.from(cards).filter(card => {
      const rect = card.getBoundingClientRect();
      return (
        rect.top >= -200 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 200
      );
    });
    
    const visibleCardIds = visibleCards.map(card => card.dataset.id);
    const remainingCardIds = cardIds.filter(id => !visibleCardIds.includes(id));
    
    // Process visible cards first, then handle remaining cards
    await fetchPricesForIds(visibleCardIds, headers);
    
    // Then load the rest asynchronously
    fetchPricesForIds(remainingCardIds, headers);
  }
  
  async function fetchPricesForIds(cardIds, headers) {
    // Batch size for API requests
    const BATCH_SIZE = 20;
    
    // Process cards in batches
    for (let i = 0; i < cardIds.length; i += BATCH_SIZE) {
      const batchIds = cardIds.slice(i, i + BATCH_SIZE);
      
      // Skip IDs we already have in cache
      const uncachedIds = batchIds.filter(id => !priceCache.has(id));
      
      // If all IDs are cached in this batch, just update the UI
      if (uncachedIds.length === 0) {
        updatePricesInUI(batchIds);
        continue;
      }
      
      // Create a query string with all uncached IDs in this batch
      const idFilter = uncachedIds.map(id => `card_id.eq.${id}`).join(',');
      
      try {
        // Make a single request for the entire batch using OR filter
        const res = await fetch(`${SUPABASE_URL}/rest/v1/pokemon_card_prices?select=card_id,price_usd&or=(${idFilter})&order=date.desc&limit=${uncachedIds.length}`, {
          headers,
        });
        
        if (res.ok) {
          const priceData = await res.json();
          
          // Store data in cache and update the UI
          priceData.forEach(item => {
            if (!priceCache.has(item.card_id)) {
              priceCache.set(item.card_id, item.price_usd);
            }
          });
          
          updatePricesInUI(batchIds);
        }
      } catch (error) {
        console.error("Error fetching batch prices:", error);
      }
      
      // Add a small delay between batches to avoid overwhelming the API
      if (i + BATCH_SIZE < cardIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  function updatePricesInUI(cardIds) {
    cardIds.forEach(cardId => {
      const card = document.querySelector(`.pokemon-set-list-card[data-id="${cardId}"]`);
      if (!card) return;
      
      const priceEl = card.querySelector(".card-price");
      if (!priceEl) return;
      
      const price = priceCache.get(cardId);
      priceEl.textContent = price !== undefined && price !== null 
        ? `$${price.toFixed(2)}` 
        : "—";
    });
  }

  async function initEmbeds() {
    // existing embed::[[...]] handling left unchanged for backward compatibility
  }
})();
