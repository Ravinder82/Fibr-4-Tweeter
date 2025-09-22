// Debug script to test history functionality
console.log('=== DEBUG: History Feature Test ===');

// Check if all required components are loaded
setTimeout(() => {
  console.log('1. Checking window objects:');
  console.log('   - window.HistoryManager:', typeof window.HistoryManager);
  console.log('   - window.TabTalkStorage:', typeof window.TabTalkStorage);
  console.log('   - window.TabTalkUI:', typeof window.TabTalkUI);
  console.log('   - window.historyManager:', typeof window.historyManager);

  // Check if history view exists
  const historyView = document.getElementById('history-view');
  console.log('2. History view element:', historyView ? 'Found' : 'Missing');

  // Check if sidebar menu item exists
  const historyLink = document.getElementById('menu-history-link');
  console.log('3. History menu link:', historyLink ? 'Found' : 'Missing');

  // Check if save button CSS is loaded
  const testCard = document.querySelector('.twitter-card');
  if (testCard) {
    const saveBtn = testCard.querySelector('.save-btn');
    console.log('4. Save button on card:', saveBtn ? 'Found' : 'Missing');
  } else {
    console.log('4. No twitter cards found to check for save buttons');
  }

  // Test creating a save button manually
  console.log('5. Testing save button creation...');
  if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
    console.log('   - addSaveButtonToCard method exists');
    
    // Test if save button is being added to existing cards
    const allCards = document.querySelectorAll('.twitter-card');
    console.log(`   - Found ${allCards.length} twitter cards`);
    allCards.forEach((card, index) => {
      const saveBtn = card.querySelector('.save-btn');
      console.log(`   - Card ${index + 1}: Save button ${saveBtn ? 'EXISTS' : 'MISSING'}`);
    });
  } else {
    console.log('   - addSaveButtonToCard method missing');
  }

  // Check CSS styles
  const styles = getComputedStyle(document.body);
  console.log('6. CSS check complete');

}, 2000);
