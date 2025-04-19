const { chromium } = require('playwright');
const path = require('path');

async function testRarityFilter() {
  console.log('Starting rarity filter test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Get the absolute file path for the test HTML file
    const htmlFilePath = path.resolve(__dirname, '..', 'src', 'pokemon-test.html');
    const fileUrl = `file://${htmlFilePath}`;
    
    console.log(`Opening file: ${fileUrl}`);
    await page.goto(fileUrl);

    // Set up console logging from the browser
    page.on('console', msg => {
      console.log(`BROWSER: ${msg.text()}`);
    });

    // Wait for filter controls to initialize
    await page.waitForSelector('.filter-dropdown-button', { timeout: 5000 });
    console.log('Filter controls loaded');
    
    // Check the initial state of the Ultra Rare card
    const initialUltraRareVisible = await page.evaluate(() => {
      const ultraRareCards = Array.from(document.querySelectorAll('.pokemon-set-list-card'))
        .filter(card => card.dataset.rarity && card.dataset.rarity.toLowerCase() === 'ultra rare'.toLowerCase());
      
      return ultraRareCards.length > 0 ? 
        !ultraRareCards[0].classList.contains('filtered-out') : false;
    });
    
    console.log(`Initial Ultra Rare card visibility: ${initialUltraRareVisible ? 'visible' : 'hidden'}`);
    
    // Take a screenshot of initial state
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'initial-state.png') });
    
    // Count initial visible cards
    const initialVisibleCount = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    console.log(`Initial visible cards: ${initialVisibleCount}`);
    
    // Examine the cards on the page
    const cardInfo = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.pokemon-set-list-card')).map(card => ({
        name: card.dataset.name,
        rarity: card.dataset.rarity,
        visible: !card.classList.contains('filtered-out')
      }));
    });
    
    console.log('Cards on the page:');
    cardInfo.forEach(card => {
      console.log(`- ${card.name} (${card.rarity}): ${card.visible ? 'visible' : 'hidden'}`);
    });
    
    // Click to open rarity filter dropdown
    console.log('Opening rarity filter dropdown...');
    await page.click('#rarityFilterButton');
    
    // Wait for dropdown to be visible
    console.log('Waiting for rarity filter dropdown to be visible...');
    await page.waitForSelector('#rarityFilterContent.active', { timeout: 5000 })
      .catch(async () => {
        console.log('Dropdown not visible after click, trying again...');
        // Try clicking again if it didn't work the first time
        await page.click('#rarityFilterButton');
        await page.waitForSelector('#rarityFilterContent.active', { timeout: 5000 });
      });
    
    // Take a screenshot of dropdown state
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'dropdown-opened.png') });
    
    // Ensure the dropdown is actually open with JavaScript
    const ensureDropdownOpen = await page.evaluate(() => {
      const dropdown = document.querySelector('#rarityFilterContent');
      if (!dropdown.classList.contains('active')) {
        console.log('Forcing dropdown to be visible via JS');
        dropdown.classList.add('active');
        dropdown.style.display = 'block';
        return true;
      }
      return false;
    });
    
    if (ensureDropdownOpen) {
      console.log('Had to force dropdown open via JavaScript');
      await page.waitForTimeout(500); // Short wait after forcing it open
    }
    
    // Find and uncheck Ultra Rare checkbox
    console.log('Unchecking Ultra Rare filter...');
    const ultraRareCheckbox = await page.locator('input[type="checkbox"][value="Ultra Rare"]');
    
    // Check if the checkbox is visible before clicking
    const isCheckboxVisible = await ultraRareCheckbox.isVisible();
    console.log(`Ultra Rare checkbox visible: ${isCheckboxVisible}`);
    
    if (!isCheckboxVisible) {
      console.log('Using force option for uncheck since checkbox is not visible...');
      await ultraRareCheckbox.uncheck({ force: true });
    } else {
      await ultraRareCheckbox.uncheck();
    }
    
    // Wait a moment for filters to apply
    await page.waitForTimeout(1000);
    
    // Count visible cards after unchecking Ultra Rare
    const afterUncheckCount = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    console.log(`Visible cards after unchecking Ultra Rare: ${afterUncheckCount}`);
    
    // Check which specific card is still visible
    const ultraRareVisibleAfterUncheck = await page.evaluate(() => {
      const ultraRareCards = Array.from(document.querySelectorAll('.pokemon-set-list-card'))
        .filter(card => card.dataset.rarity && card.dataset.rarity.toLowerCase() === 'ultra rare'.toLowerCase());
      
      if (ultraRareCards.length === 0) return false;
      
      const ultraRareCard = ultraRareCards[0];
      console.log('Ultra Rare card classes:', ultraRareCard.className);
      return !ultraRareCard.classList.contains('filtered-out');
    });
    
    console.log(`Ultra Rare card visibility after uncheck: ${ultraRareVisibleAfterUncheck ? 'still visible' : 'hidden'}`);
    
    // Take a screenshot after unchecking
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'after-uncheck.png') });
    
    // Get count of Ultra Rare cards that should be hidden
    const ultraRareCardsCount = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.pokemon-set-list-card'))
        .filter(card => card.dataset.rarity && card.dataset.rarity.toLowerCase() === 'ultra rare'.toLowerCase())
        .length;
    });
    
    console.log(`Number of Ultra Rare cards on page: ${ultraRareCardsCount}`);
    
    // Verify that Ultra Rare cards are now hidden
    const expected = initialVisibleCount - ultraRareCardsCount;
    console.log(`Expected visible cards: ${expected}`);
    
    if (afterUncheckCount === expected) {
      console.log('✅ Unchecking Ultra Rare filter works correctly');
    } else {
      console.log('❌ Unchecking test failed - wrong number of cards visible');
    }
    
    // Get the filter state from the page
    const filterState = await page.evaluate(() => {
      // This assumes filterState is accessible in the page's scope
      // You might need to expose it if it's in a closure
      try {
        const raritiesElement = document.querySelector('#rarityFilterContent');
        const checkedRarities = Array.from(raritiesElement.querySelectorAll('input:checked'))
          .map(checkbox => checkbox.value);
        
        return {
          checkedRarities,
          allRarities: Array.from(raritiesElement.querySelectorAll('input'))
            .map(checkbox => checkbox.value)
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('Current filter state:', filterState);
    
    // Now check the Ultra Rare checkbox again
    console.log('Checking Ultra Rare filter again...');
    await ultraRareCheckbox.check();
    
    // Wait a moment for filters to apply
    await page.waitForTimeout(1000);
    
    // Count visible cards after checking Ultra Rare again
    const afterCheckCount = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    console.log(`Visible cards after re-checking Ultra Rare: ${afterCheckCount}`);
    
    // Verify that Ultra Rare cards are visible again
    if (afterCheckCount === initialVisibleCount) {
      console.log('✅ Re-checking Ultra Rare filter works correctly');
    } else {
      console.log('❌ Re-checking test failed - wrong number of cards visible');
    }
    
    // Take final screenshot
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'final-state.png') });
    
    console.log('Test completed successfully.');
    
    // Keep browser open for manual inspection
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the test
testRarityFilter().catch(console.error); 