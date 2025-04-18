// Basic version that just adds filter controls
console.log("Simple card list script loading");

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM content loaded");
  
  // Add a basic filter container
  const gridContainer = document.querySelector(".pokemon-set-list-grid");
  if (gridContainer) {
    console.log("Grid container found");
    
    // Create filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'pokemon-set-filter-controls';
    filterControls.style.display = 'flex';
    filterControls.style.justifyContent = 'center';
    filterControls.style.margin = '20px 0';
    filterControls.innerHTML = `
      <div style="padding: 10px; background: #fff; margin: 0 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <button>Filter by Type</button>
      </div>
      <div style="padding: 10px; background: #fff; margin: 0 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <button>Filter by Rarity</button>
      </div>
    `;
    
    // Insert before the grid
    gridContainer.parentNode.insertBefore(filterControls, gridContainer);
    console.log("Filter controls added");
  } else {
    console.error("Grid container not found");
  }
});

// Add a delayed check as well
setTimeout(() => {
  console.log("Checking after timeout");
  const filterControls = document.querySelector('.pokemon-set-filter-controls');
  console.log("Filter controls present:", !!filterControls);
  
  if (!filterControls) {
    console.log("Trying to add controls again");
    const gridContainer = document.querySelector(".pokemon-set-list-grid");
    if (gridContainer) {
      const filterControls = document.createElement('div');
      filterControls.className = 'pokemon-set-filter-controls';
      filterControls.innerHTML = '<div style="padding: 10px; background: red; color: white;">Emergency Filter Controls</div>';
      gridContainer.parentNode.insertBefore(filterControls, gridContainer);
    }
  }
}, 2000); 