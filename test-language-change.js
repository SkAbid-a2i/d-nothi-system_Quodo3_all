// Test script to verify language change functionality
const fs = require('fs');
const path = require('path');

// Check if translation files exist and have the required keys
const enTranslations = require('./client/src/services/translations/en.js').default;
const bnTranslations = require('./client/src/services/translations/bn.js').default;

console.log('Testing language change functionality...\n');

// Check English translations
console.log('1. Checking English translations...');
const enNav = enTranslations.navigation;
if (enNav.meetings && enNav.errorMonitoring) {
  console.log('✅ English: Meetings and Error Monitoring translations found');
} else {
  console.log('❌ English: Missing Meetings or Error Monitoring translations');
}

// Check Bangla translations
console.log('\n2. Checking Bangla translations...');
const bnNav = bnTranslations.navigation;
if (bnNav.meetings && bnNav.errorMonitoring) {
  console.log('✅ Bangla: Meetings and Error Monitoring translations found');
} else {
  console.log('❌ Bangla: Missing Meetings or Error Monitoring translations');
}

console.log('\n3. Checking Layout component...');
// Read the Layout component to verify it uses translations
const layoutPath = path.join(__dirname, 'client/src/components/Layout.js');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

if (layoutContent.includes("t('navigation.meetings')") && layoutContent.includes("t('navigation.errorMonitoring')")) {
  console.log('✅ Layout component uses translation keys for Meetings and Error Monitoring');
} else {
  console.log('❌ Layout component may not be using translation keys properly');
}

console.log('\n🎉 Language change functionality test completed!');