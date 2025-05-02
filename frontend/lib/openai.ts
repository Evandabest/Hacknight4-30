import axios from 'axios';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo';  // You can use 'gpt-4' if you have access

// Interface for the extracted query information
export interface QueryInfo {
  line?: string;
  isGeneralQuery: boolean;
  specificQuery: string;
}

/**
 * Extract structured information from a natural language query using OpenAI
 */
export async function extractQueryInfo(query: string): Promise<QueryInfo> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, falling back to basic extraction');
      // Fallback to basic extraction if no API key
      const lineMatch = query.match(/line\s+([A-Z0-9])/i) || query.match(/([A-Z0-9])\s+train/i);
      
      return {
        line: lineMatch ? lineMatch[1].toUpperCase() : undefined,
        isGeneralQuery: !lineMatch,
        specificQuery: query
      };
    }
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that extracts structured information from queries about NYC subway status. 
                     Extract the subway line if mentioned (1, 2, 3, 4, 5, 6, 7, A, B, C, D, E, F, G, J, L, M, N, Q, R, S, W, Z). 
                     Determine if it's a general query about all subway lines or specific to one line.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        functions: [
          {
            name: 'extract_query_info',
            description: 'Extract structured information from a subway status query',
            parameters: {
              type: 'object',
              properties: {
                line: {
                  type: 'string',
                  description: 'The subway line mentioned in the query (1, 2, 3, 4, 5, 6, 7, A, B, C, D, E, F, G, J, L, M, N, Q, R, S, W, Z)',
                },
                isGeneralQuery: {
                  type: 'boolean',
                  description: 'Whether the query is about general subway status rather than a specific line',
                },
                specificQuery: {
                  type: 'string',
                  description: 'The specific question being asked (delays, service status, etc.)',
                }
              },
              required: ['isGeneralQuery', 'specificQuery']
            }
          }
        ],
        function_call: { name: 'extract_query_info' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const functionCall = response.data.choices[0]?.message?.function_call;
    
    if (functionCall && functionCall.name === 'extract_query_info') {
      const args = JSON.parse(functionCall.arguments);
      return {
        line: args.line,
        isGeneralQuery: args.isGeneralQuery,
        specificQuery: args.specificQuery
      };
    }
    
    // Fallback if function calling fails
    throw new Error('Failed to extract structured data from query');
    
  } catch (error) {
    console.error('Error extracting query info:', error);
    
    // Fallback to basic extraction
    const lineMatch = query.match(/line\s+([A-Z0-9])/i) || query.match(/([A-Z0-9])\s+train/i);
    
    return {
      line: lineMatch ? lineMatch[1].toUpperCase() : undefined,
      isGeneralQuery: !lineMatch,
      specificQuery: query
    };
  }
}

/**
 * Generate a natural language response based on subway status
 */
export async function generateResponse(query: string, statusInfo: any): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback to template response if no API key
      if (statusInfo.hasDelay) {
        return `The ${statusInfo.line} train is currently experiencing delays. ${statusInfo.details}`;
      } else {
        return `The ${statusInfo.line} train is running with good service.`;
      }
    }
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a helpful NYC subway assistant. Provide concise, friendly responses about 
                     subway status. Be conversational but focus on delivering the key information clearly.`
          },
          {
            role: 'user',
            content: `User query: "${query}"\n\nTrain status data: ${JSON.stringify(statusInfo)}\n\nPlease respond to the user's query with this data.`
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    
  } catch (error) {
    console.error('Error generating response:', error);
    
    // Fallback to template response
    if (statusInfo.line) {
      if (statusInfo.hasDelay) {
        return `The ${statusInfo.line} train is currently experiencing delays. ${statusInfo.details}`;
      } else {
        return `The ${statusInfo.line} train is running with good service.`;
      }
    } else {
      return 'Sorry, I couldn\'t generate a response. Please try again.';
    }
  }
}