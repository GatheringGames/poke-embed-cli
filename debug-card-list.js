// Debug version of card-list.js with more logging
document.head.appendChild(document.createElement("style")).textContent = `
/* Base styles for page */
body {
  background: #f5f5f5;
}

/* Card grid layout */
.pokemon-set-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.pokemon-set-list-card {
  text-align: center;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
  cursor: pointer;
}

/* Filter controls styles */
.pokemon-set-filter-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.filter-dropdown {
  position: relative;
  display: inline-block;
}

.filter-dropdown-button {
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 150px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  left: 0;
  top: 100%;
}

.filter-dropdown.show .filter-dropdown-content {
  display: block;
}

.filter-type-icon {
  height: 14px !important;
  width: 14px !important;
  margin-right: 4px !important;
  vertical-align: middle !important;
  display: inline-block !important;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  max-width: none !important;
  min-width: 0 !important;
}

/* Card hiding for filters */
.pokemon-set-list-card.filtered-out {
  display: none;
}
`;

// IIFE with debug additions
(async () => {
  console.log("Debug script started");

  // Constants
  const TYPE_ICONS = {
    "Grass": "https://js.gatheringgames.co.uk/symbols/grass.svg",
    "Fire": "https://js.gatheringgames.co.uk/symbols/fire.svg",
    "Water": "https://js.gatheringgames.co.uk/symbols/water.svg",
    "Lightning": "https://js.gatheringgames.co.uk/symbols/lightning.svg",
    "Psychic": "https://js.gatheringgames.co.uk/symbols/psychic.svg",
    "Fighting": "https://js.gatheringgames.co.uk/symbols/fighting.svg",
    "Darkness": "https://js.gatheringgames.co.uk/symbols/darkness.svg",
    "Metal": "https://js.gatheringgames.co.uk/symbols/metal.svg",
    "Dragon": "https://js.gatheringgames.co.uk/symbols/dragon.svg",
    "Colorless": "https://js.gatheringgames.co.uk/symbols/colorless.svg",
    "Trainer": "", // No specific icon for Trainer
    "Special Energy": "https://js.gatheringgames.co.uk/symbols/colorless.svg" // Using colorless for special energy
  };

  // Filter state - initialize with all types and rarities as selected
  const filterState = {
    types: new Set(),
    rarities: new Set(),
    allTypes: new Set(),
    allRarities: new Set()
  };

  // Define the rarity order for sorting
  const RARITY_ORDER = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 3,
    'Double Rare': 4,
    'Illustration Rare': 5,
    'Ultra Rare': 6,
    'Special Illustration Rare': 7,
    'Hyper Rare': 8
  };

  // Function to create filter controls with debug info
  function createFilterControls() {
    console.log("Creating filter controls...");
    
    const gridContainer = document.querySelector('.pokemon-set-list-grid');
    console.log("Grid container found:", !!gridContainer);
    
    if (!gridContainer) {
      console.error("Grid container not found, can't add filter controls");
      return;
    }
    
    // Collect all types and rarities that exist in the data
    const allTypes = new Set();
    const allRarities = new Set();
    
    // Process all cards to get unique types and rarities
    const cards = document.querySelectorAll('.pokemon-set-list-card');
    console.log(`Found ${cards.length} cards to process for filter data`);
    
    cards.forEach((card, index) => {
      // Get rarity
      const rarity = card.dataset.rarity;
      if (rarity) {
        allRarities.add(rarity);
        console.log(`Card ${index} rarity: ${rarity}`);
      }
      
      // Get types for Pokemon cards
      const types = card.dataset.types ? card.dataset.types.split(', ') : [];
      types.forEach(type => {
        if (type) {
          allTypes.add(type);
          console.log(`Card ${index} type: ${type}`);
        }
      });
      
      // Add supertype for non-Pokemon cards
      const supertype = card.dataset.supertype;
      if (supertype === 'Trainer') {
        allTypes.add('Trainer');
        console.log(`Card ${index} is a Trainer card`);
      } else if (supertype === 'Energy') {
        if (card.dataset.subtype === 'Special') {
          allTypes.add('Special Energy');
          console.log(`Card ${index} is a Special Energy card`);
        } else {
          // Regular energy uses its type
          types.forEach(type => {
            if (type) allTypes.add(type);
          });
        }
      }
    });
    
    console.log("All types collected:", Array.from(allTypes));
    console.log("All rarities collected:", Array.from(allRarities));
    
    // Initialize filterState with all types and rarities
    filterState.allTypes = new Set(allTypes);
    filterState.allRarities = new Set(allRarities);
    
    // By default, all options are selected
    filterState.types = new Set(allTypes);
    filterState.rarities = new Set(allRarities);
    
    // Create filter controls container
    const filterControls = document.createElement('div');
    filterControls.className = 'pokemon-set-filter-controls';
    filterControls.id = 'debugFilterControls';
    
    // Create type filter dropdown
    const typeDropdown = document.createElement('div');
    typeDropdown.className = 'filter-dropdown';
    typeDropdown.innerHTML = `
      <button class="filter-dropdown-button" id="typeFilterButton">Card Type</button>
      <div class="filter-dropdown-content" id="typeFilterContent">
        ${Object.entries(TYPE_ICONS).map(([type, iconUrl]) => {
          // Only include types that exist in our data
          if (!allTypes.has(type)) return '';
          
          return `
            <label class="filter-checkbox-item">
              <input type="checkbox" value="${type}" data-filter-type="type" checked>
              ${iconUrl ? `<img src="${iconUrl}" alt="${type}" class="filter-type-icon" style="height:14px; width:14px; vertical-align:middle; margin-right:4px; background:none; box-shadow:none; border:none; padding:0; border-radius:0; display:inline-block; max-width:none; min-width:0;">` : ''}
              ${type}
            </label>
          `;
        }).filter(html => html !== '').join('')}
      </div>
    `;
    
    // Create rarity filter dropdown
    const rarityDropdown = document.createElement('div');
    rarityDropdown.className = 'filter-dropdown';
    rarityDropdown.innerHTML = `
      <button class="filter-dropdown-button" id="rarityFilterButton">Rarity</button>
      <div class="filter-dropdown-content" id="rarityFilterContent">
        ${Array.from(allRarities)
          // Sort by the predefined rarity order
          .sort((a, b) => {
            const orderA = RARITY_ORDER[a] || 999; // Default high value for unknown rarities
            const orderB = RARITY_ORDER[b] || 999;
            return orderA - orderB;
          })
          .map(rarity => {
            return `
              <label class="filter-checkbox-item">
                <input type="checkbox" value="${rarity}" data-filter-type="rarity" checked>
                ${rarity}
              </label>
            `;
          }).join('')}
      </div>
    `;
    
    // Add elements to the filter controls
    filterControls.appendChild(typeDropdown);
    filterControls.appendChild(rarityDropdown);
    
    console.log("Filter controls HTML created:", filterControls.outerHTML);
    
    // Insert the filter controls before the grid
    gridContainer.parentNode.insertBefore(filterControls, gridContainer);
    console.log("Filter controls inserted into DOM");
    
    // Toggle dropdowns
    document.getElementById('typeFilterButton').addEventListener('click', function(e) {
      console.log("Type filter button clicked");
      e.stopPropagation();
      document.getElementById('rarityFilterContent').parentElement.classList.remove('show');
      this.parentElement.classList.toggle('show');
    });
    
    document.getElementById('rarityFilterButton').addEventListener('click', function(e) {
      console.log("Rarity filter button clicked");
      e.stopPropagation();
      document.getElementById('typeFilterContent').parentElement.classList.remove('show');
      this.parentElement.classList.toggle('show');
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.filter-dropdown')) {
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
    });
  }
  
  // Initialize
  console.log("Starting initialization");
  createFilterControls();
  console.log("Initialization complete");
  
  // Add a check after a delay to see if filters were created
  setTimeout(() => {
    const filterControls = document.querySelector('.pokemon-set-filter-controls');
    console.log("Filter controls present after 1 second:", !!filterControls);
    if (!filterControls) {
      console.error("Filter controls still not in DOM after 1 second");
      
      // Try to create them again
      console.log("Attempting to create filter controls again...");
      createFilterControls();
      
      // Check parent
      const gridContainer = document.querySelector('.pokemon-set-list-grid');
      if (gridContainer && gridContainer.parentNode) {
        console.log("Grid container parent:", gridContainer.parentNode.tagName);
      } else {
        console.error("Grid container or its parent is unavailable");
      }
    }
  }, 1000);
})(); 