// Script to run the demo packages addition
import { addDemoPackages } from './add-demo-packages.js';

console.log('🚀 Starting demo packages addition...');
console.log('⏰ This may take a few minutes depending on the number of vendors...');

// Run the script
addDemoPackages()
  .then(() => {
    console.log('✅ Demo packages addition completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error running demo packages addition:', error);
    process.exit(1);
  });



