import axios from 'axios';
import * as cheerio from 'cheerio';
import { TrainStatus } from './weaviate';

// Function to scrape train status data from realtimerail.nyc
export async function scrapeTrainStatus(line: string): Promise<TrainStatus | null> {
  try {
    const url = `https://realtimerail.nyc/routes/${line}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const statusData: TrainStatus = {
      line,
      timestamp: new Date().toISOString(),
      status: 'Good Service', // Default status
      details: '',
      hasDelay: false
    };
    
    // Check if there's a message div indicating delays or issues
    const messageDiv = $('.message');
    if (messageDiv.length > 0) {
      statusData.hasDelay = true;
      statusData.status = 'Delayed';
      
      // Extract all text from the message div
      statusData.details = messageDiv.text().trim();
      
      // You can add more detailed parsing here if needed
      // For example, extract specific delay reasons, affected stations, etc.
    }
    
    console.log(`Scraped data for line ${line}:`, statusData);
    return statusData;
  } catch (error) {
    console.error(`Error scraping line ${line}:`, error);
    return null;
  }
}

// NYC Subway lines to monitor
export const subwayLines = [
  '1', '2', '3', '4', '5', '6', '7', 
  'A', 'C', 'E', 'B', 'D', 'F', 'M', 
  'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', 'S'
];

// Function to scrape all subway lines
export async function scrapeAllLines(): Promise<Map<string, TrainStatus>> {
  const results = new Map<string, TrainStatus>();
  
  for (const line of subwayLines) {
    const status = await scrapeTrainStatus(line);
    if (status) {
      results.set(line, status);
    }
  }
  
  return results;
}