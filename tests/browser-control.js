const { chromium } = require('playwright');
const path = require('path');

async function runBrowserTest() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Get the absolute file path for the HTML test file in the src directory
    const htmlFilePath = path.resolve(__dirname, '..', 'src', 'pokemon-test.html');
    const fileUrl = `file://${htmlFilePath}`;
    
    console.log(`Opening file: ${fileUrl}`);
    await page.goto(fileUrl);

    // Set up console logging
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE: ${msg.text()}`);
    });

    // Wait for the initial load
    await page.waitForSelector('.pokemon-set-filter-controls', { timeout: 5000 })
      .catch(() => console.log('Filter controls not found within timeout'));
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'initial-state.png') });
    console.log('Initial state screenshot saved');
    
    // Wait a moment to make sure everything is initialized
    await page.waitForTimeout(2000);
    
    // Test filter functionality by clicking the rarity filter button
    console.log('Opening rarity filter dropdown...');
    await page.click('#rarityFilterButton');
    
    // Wait for dropdown to appear
    await page.waitForSelector('.filter-dropdown.show', { timeout: 5000 })
      .catch(() => console.log('Filter dropdown did not open'));
    
    // Take a screenshot with the dropdown open
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'dropdown-open.png') });
    console.log('Dropdown open screenshot saved');
    
    // Try to uncheck Ultra Rare checkbox
    console.log('Unchecking Ultra Rare filter...');
    await page.locator('input[type="checkbox"][value="Ultra Rare"]').uncheck()
      .catch(() => console.log('Could not uncheck Ultra Rare filter'));
    
    // Wait a moment for filters to apply
    await page.waitForTimeout(1000);
    
    // Take a screenshot after filtering
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'filtered.png') });
    console.log('Filtered state screenshot saved');
    
    // Count visible and hidden cards
    const visibleCards = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    const hiddenCards = await page.locator('.pokemon-set-list-card.filtered-out').count();
    console.log(`After filtering - Visible cards: ${visibleCards}, Hidden cards: ${hiddenCards}`);
    
    // Keep the browser open for 30 seconds so you can interact with it
    console.log('Test complete. Browser will stay open for 30 seconds for manual interaction...');
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('Error during browser test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

runBrowserTest().catch(console.error); 