/**
 * Script to collect NYC subway status data
 * Run with: npm run collect-data
 */

import { setupWeaviateSchema, storeTrainStatus } from '../lib/weaviate';
import { scrapeAllLines } from '../lib/scraper';

async function main() {
  console.log('NYC Transit Agent - Data Collection Script');
  console.log('=========================================');
  
  try {
    // Ensure Weaviate schema is set up
    console.log('Setting up Weaviate schema...');
    await setupWeaviateSchema();
    
    // Scrape and store data for each subway line
    console.log('Scraping subway status data...');
    const allStatusData = await scrapeAllLines();
    
    console.log(`Found status data for ${allStatusData.size} subway lines`);
    
    // Store each status in Weaviate
    console.log('Storing data in Weaviate...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const [line, status] of allStatusData.entries()) {
      try {
        await storeTrainStatus(status);
        successCount++;
        
        // Indicate if there's a delay
        if (status.hasDelay) {
          console.log(`Line ${line}: DELAY - ${status.details.substring(0, 50)}...`);
        } else {
          console.log(`Line ${line}: Good Service`);
        }
      } catch (error) {
        console.error(`Error storing data for line ${line}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nData collection completed');
    console.log(`Successfully stored: ${successCount} lines`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount} lines`);
    }
  } catch (error) {
    console.error('Error in data collection process:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });