const { chromium } = require('playwright');
const path = require('path');

async function testRarityFilterCombinations() {
  console.log('Starting comprehensive rarity filter test...');
  
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
    
    // Get information about available cards and rarities
    const cardInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.pokemon-set-list-card'));
      const cardData = cards.map(card => ({
        name: card.dataset.name,
        rarity: card.dataset.rarity,
        visible: !card.classList.contains('filtered-out')
      }));
      
      // Count cards by rarity
      const rarityCount = {};
      cardData.forEach(card => {
        const rarity = card.rarity;
        rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
      });
      
      return { cards: cardData, rarityCount };
    });
    
    console.log('Cards on the page:');
    cardInfo.cards.forEach(card => {
      console.log(`- ${card.name} (${card.rarity}): ${card.visible ? 'visible' : 'hidden'}`);
    });
    
    console.log('Rarity counts:');
    Object.entries(cardInfo.rarityCount).forEach(([rarity, count]) => {
      console.log(`- ${rarity}: ${count} cards`);
    });
    
    // Take a screenshot of initial state
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'comprehensive-initial.png') });
    
    // Open rarity filter dropdown
    console.log('Opening rarity filter dropdown...');
    await page.click('#rarityFilterButton');
    
    // Wait for dropdown to be visible
    console.log('Waiting for rarity filter dropdown to be visible...');
    await page.waitForSelector('#rarityFilterContent.active', { timeout: 5000 })
      .catch(async () => {
        console.log('Dropdown not visible after click, trying again...');
        await page.click('#rarityFilterButton');
        await page.waitForSelector('#rarityFilterContent.active', { timeout: 5000 });
      });
    
    // Ensure the dropdown is actually open with JavaScript
    await page.evaluate(() => {
      const dropdown = document.querySelector('#rarityFilterContent');
      if (!dropdown.classList.contains('active')) {
        console.log('Forcing dropdown to be visible via JS');
        dropdown.classList.add('active');
        dropdown.style.display = 'block';
        return true;
      }
      return false;
    });
    
    // Get all rarity checkboxes
    const rarityCheckboxes = await page.$$('.rarity-filter');
    console.log(`Found ${rarityCheckboxes.length} rarity checkboxes`);
    
    // Get rarity values from checkboxes
    const rarityValues = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.rarity-filter'))
        .map(checkbox => checkbox.value);
    });
    console.log('Available rarities:', rarityValues);
    
    // Test 1: Uncheck all rarities one by one
    console.log('\n=== TEST 1: Uncheck all rarities one by one ===');
    
    for (const rarityValue of rarityValues) {
      console.log(`\nTesting unchecking ${rarityValue}...`);
      
      // Uncheck the specific rarity
      const checkbox = await page.locator(`.rarity-filter[value="${rarityValue}"]`);
      await checkbox.uncheck();
      
      // Wait a moment for filters to apply
      await page.waitForTimeout(500);
      
      // Check which cards are visible
      const visibleCardsAfterUncheck = await page.evaluate((uncheckedRarity) => {
        const cards = document.querySelectorAll('.pokemon-set-list-card');
        const visibleCards = Array.from(cards).filter(card => !card.classList.contains('filtered-out'));
        
        // Check that no card with the unchecked rarity is visible
        const visibleWithUncheckedRarity = Array.from(cards)
          .filter(card => !card.classList.contains('filtered-out') && 
                  card.dataset.rarity.toLowerCase() === uncheckedRarity.toLowerCase())
          .length;
          
        return {
          totalVisible: visibleCards.length,
          visibleWithUncheckedRarity,
          visibleCards: visibleCards.map(card => ({
            name: card.dataset.name,
            rarity: card.dataset.rarity
          }))
        };
      }, rarityValue);
      
      console.log(`Visible cards after unchecking ${rarityValue}: ${visibleCardsAfterUncheck.totalVisible}`);
      console.log(`Cards with ${rarityValue} still visible: ${visibleCardsAfterUncheck.visibleWithUncheckedRarity}`);
      
      if (visibleCardsAfterUncheck.visibleWithUncheckedRarity === 0) {
        console.log(`✅ ${rarityValue} filter works correctly when unchecked`);
      } else {
        console.log(`❌ ${rarityValue} filter failed - cards with this rarity are still visible`);
      }
      
      // Check the rarity again (reset state)
      await checkbox.check();
      await page.waitForTimeout(500);
    }
    
    // Test 2: Only check one rarity at a time
    console.log('\n=== TEST 2: Only check one rarity at a time ===');
    
    // First uncheck all rarities
    for (const checkbox of rarityCheckboxes) {
      await checkbox.uncheck();
      await page.waitForTimeout(200);
    }
    
    // Then check one rarity at a time
    for (const rarityValue of rarityValues) {
      console.log(`\nTesting only ${rarityValue} checked...`);
      
      // Check the specific rarity
      const checkbox = await page.locator(`.rarity-filter[value="${rarityValue}"]`);
      await checkbox.check();
      
      // Wait a moment for filters to apply
      await page.waitForTimeout(500);
      
      // Check which cards are visible
      const visibleCards = await page.evaluate((checkedRarity) => {
        const cards = document.querySelectorAll('.pokemon-set-list-card');
        const visibleCards = Array.from(cards).filter(card => !card.classList.contains('filtered-out'));
        
        const visibleWithDifferentRarity = Array.from(cards)
          .filter(card => !card.classList.contains('filtered-out') && 
                  card.dataset.rarity.toLowerCase() !== checkedRarity.toLowerCase())
          .length;
          
        const expectedVisibleCount = Array.from(cards)
          .filter(card => card.dataset.rarity.toLowerCase() === checkedRarity.toLowerCase())
          .length;
        
        return {
          totalVisible: visibleCards.length,
          expectedVisible: expectedVisibleCount,
          visibleWithDifferentRarity,
          visibleCards: visibleCards.map(card => ({
            name: card.dataset.name,
            rarity: card.dataset.rarity
          }))
        };
      }, rarityValue);
      
      console.log(`Visible cards with only ${rarityValue} checked: ${visibleCards.totalVisible}`);
      console.log(`Expected visible cards: ${visibleCards.expectedVisible}`);
      console.log(`Cards with different rarity visible: ${visibleCards.visibleWithDifferentRarity}`);
      
      if (visibleCards.visibleWithDifferentRarity === 0 && 
          visibleCards.totalVisible === visibleCards.expectedVisible) {
        console.log(`✅ ${rarityValue} filter works correctly when only this rarity is checked`);
      } else {
        console.log(`❌ ${rarityValue} filter failed - wrong cards are visible`);
      }
      
      // Uncheck the rarity again (reset for next test)
      await checkbox.uncheck();
      await page.waitForTimeout(200);
    }
    
    // Test 3: Check specific combinations of rarities
    console.log('\n=== TEST 3: Check specific combinations of rarities ===');
    
    // Test combination pairs
    const combinationsToTest = [
      { name: "Common and Uncommon", values: ["Common", "Uncommon"] },
      { name: "Rare and Ultra Rare", values: ["Rare", "Ultra Rare"] },
      { name: "Common and Illustration Rare", values: ["Common", "Illustration Rare"] }
    ];
    
    for (const combo of combinationsToTest) {
      console.log(`\nTesting combination: ${combo.name}...`);
      
      // First uncheck all rarities
      for (const checkbox of rarityCheckboxes) {
        await checkbox.uncheck();
        await page.waitForTimeout(200);
      }
      
      // Then check only the rarities in the combination
      for (const rarityValue of combo.values) {
        const checkbox = await page.locator(`.rarity-filter[value="${rarityValue}"]`);
        await checkbox.check();
        await page.waitForTimeout(200);
      }
      
      // Wait a moment for filters to apply
      await page.waitForTimeout(500);
      
      // Check which cards are visible
      const visibleCards = await page.evaluate((checkedRarities) => {
        const cards = document.querySelectorAll('.pokemon-set-list-card');
        const visibleCards = Array.from(cards).filter(card => !card.classList.contains('filtered-out'));
        
        // Calculate expected visible cards
        const expectedVisibleCards = Array.from(cards).filter(card => {
          const cardRarity = card.dataset.rarity.toLowerCase();
          return checkedRarities.some(r => r.toLowerCase() === cardRarity);
        });
        
        const visibleWithDifferentRarity = visibleCards.filter(card => {
          const cardRarity = card.dataset.rarity.toLowerCase();
          return !checkedRarities.some(r => r.toLowerCase() === cardRarity);
        }).length;
        
        return {
          totalVisible: visibleCards.length,
          expectedVisible: expectedVisibleCards.length,
          visibleWithDifferentRarity,
          visibleCards: visibleCards.map(card => ({
            name: card.dataset.name,
            rarity: card.dataset.rarity
          }))
        };
      }, combo.values);
      
      console.log(`Visible cards with ${combo.name} checked: ${visibleCards.totalVisible}`);
      console.log(`Expected visible cards: ${visibleCards.expectedVisible}`);
      console.log(`Cards with different rarity visible: ${visibleCards.visibleWithDifferentRarity}`);
      
      visibleCards.visibleCards.forEach(card => {
        console.log(`- ${card.name} (${card.rarity})`);
      });
      
      if (visibleCards.visibleWithDifferentRarity === 0 && 
          visibleCards.totalVisible === visibleCards.expectedVisible) {
        console.log(`✅ ${combo.name} filter combination works correctly`);
      } else {
        console.log(`❌ ${combo.name} filter combination failed - wrong cards are visible`);
      }
    }
    
    // Test 4: All rarities selected
    console.log('\n=== TEST 4: All rarities selected ===');
    
    // Check all rarities
    for (const checkbox of rarityCheckboxes) {
      await checkbox.check();
      await page.waitForTimeout(200);
    }
    
    // Wait a moment for filters to apply
    await page.waitForTimeout(500);
    
    // Count visible cards
    const allVisibleCount = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    const totalCardCount = await page.locator('.pokemon-set-list-card').count();
    
    console.log(`Visible cards with all rarities checked: ${allVisibleCount}`);
    console.log(`Total cards on page: ${totalCardCount}`);
    
    if (allVisibleCount === totalCardCount) {
      console.log('✅ All cards visible when all rarities are checked');
    } else {
      console.log('❌ Not all cards are visible when all rarities are checked');
    }
    
    // Test 5: No rarities selected
    console.log('\n=== TEST 5: No rarities selected ===');
    
    // Uncheck all rarities
    for (const checkbox of rarityCheckboxes) {
      await checkbox.uncheck();
      await page.waitForTimeout(200);
    }
    
    // Wait a moment for filters to apply
    await page.waitForTimeout(500);
    
    // Count visible cards
    const noneVisibleCount = await page.locator('.pokemon-set-list-card:not(.filtered-out)').count();
    
    console.log(`Visible cards with no rarities checked: ${noneVisibleCount}`);
    
    if (noneVisibleCount === 0) {
      console.log('✅ No cards visible when no rarities are checked');
    } else {
      console.log('❌ Some cards are still visible when no rarities are checked');
    }
    
    // Take final screenshot
    await page.screenshot({ path: path.resolve(__dirname, '..', 'screenshots', 'comprehensive-final.png') });
    
    console.log('\nComprehensive test completed successfully.');
    
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
testRarityFilterCombinations().catch(console.error); 