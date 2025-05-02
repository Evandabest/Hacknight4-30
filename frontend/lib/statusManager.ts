import { TrainStatus, setupWeaviateSchema, storeTrainStatus, queryTrainStatus, queryDelayedLines } from './weaviate';
import { scrapeTrainStatus, scrapeAllLines, subwayLines } from './scraper';
import { extractQueryInfo, generateResponse } from './openai';

// Function to collect and store all train data
export async function collectAllTrainData(): Promise<void> {
  console.log('Starting data collection...');
  
  // Ensure Weaviate schema is set up
  await setupWeaviateSchema();
  
  // Scrape and store data for each subway line
  const allStatusData = await scrapeAllLines();
  
  // Store each status in Weaviate
  for (const [line, status] of allStatusData.entries()) {
    await storeTrainStatus(status);
  }
  
  console.log(`Data collection completed for ${allStatusData.size} subway lines`);
}

// Process a natural language query about train status
export async function processQuery(query: string): Promise<string> {
  try {
    // Use OpenAI to extract structured information from the query
    const queryInfo = await extractQueryInfo(query);
    
    // If a specific line is mentioned in the query
    if (queryInfo.line && subwayLines.includes(queryInfo.line)) {
      const status = await queryTrainStatus(queryInfo.line);
      
      if (status) {
        // Use OpenAI to generate a natural language response
        return await generateResponse(query, status);
      } else {
        return `I couldn't find current information for the ${queryInfo.line} train. Please try again later.`;
      }
    } else if (queryInfo.isGeneralQuery) {
      // Handle general queries about all subway lines
      const delayedLines = await queryDelayedLines();
      
      if (delayedLines.length > 0) {
        // Get unique delayed lines
        const uniqueDelayedLines = Array.from(new Set(delayedLines.map(item => item.line)));
        
        // Create a status summary object for the response generator
        const statusSummary = {
          isGeneralQuery: true,
          delayedLines: uniqueDelayedLines,
          details: delayedLines.map(line => ({ line: line.line, details: line.details }))
        };
        
        // Generate a response
        return await generateResponse(query, statusSummary);
      } else {
        return 'All subway lines appear to be running with good service at this time.';
      }
    } else {
      // Fallback for unrecognized queries
      return "I'm not sure which subway line you're asking about. You can ask about specific lines like 'How is the 6 train?' or general questions like 'Are there any delays today?'";
    }
  } catch (error) {
    console.error('Error processing query:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again.';
  }
}