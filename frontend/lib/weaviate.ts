import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

// Define type for train status objects stored in Weaviate
export interface TrainStatus {
  line: string;
  timestamp: string;
  status: string;
  details: string;
  hasDelay: boolean;
}

// Initialize Weaviate client 
let client: WeaviateClient | null = null;

export const getWeaviateClient = (): WeaviateClient => {
  if (client) return client;
  
  const scheme = process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'https';
  const host = process.env.WEAVIATE_HOST;
  const apiKey = process.env.WEAVIATE_API_KEY;
  
  if (!host || !apiKey) {
    throw new Error('Weaviate host or API key not configured');
  }
  
  client = weaviate.client({
    scheme: scheme as 'https' | 'http',
    host,
    apiKey: new ApiKey(apiKey),
  });
  
  return client;
};

// Check if schema exists and create it if not
export const setupWeaviateSchema = async (): Promise<void> => {
  const client = getWeaviateClient();
  
  // Check if TrainStatus class exists
  const schemaExists = await client.schema.classExistsGetter().withClassName('TrainStatus').do();
  
  if (!schemaExists) {
    // Define schema for train status
    const schema = {
      class: 'TrainStatus',
      properties: [
        {
          name: 'line',
          dataType: ['string'],
          description: 'The subway line identifier',
        },
        {
          name: 'timestamp',
          dataType: ['date'],
          description: 'When the status was checked',
        },
        {
          name: 'status',
          dataType: ['string'],
          description: 'Current service status (Good Service, Delayed, etc.)',
        },
        {
          name: 'details',
          dataType: ['text'],
          description: 'Detailed information about delays or issues',
        },
        {
          name: 'hasDelay',
          dataType: ['boolean'],
          description: 'Whether the line currently has a delay',
        },
      ],
      vectorizer: 'text2vec-contextionary', // Use Weaviate's built-in vectorizer
    };
    
    // Create the schema
    await client.schema.classCreator().withClass(schema).do();
    console.log('Created TrainStatus schema in Weaviate');
  } else {
    console.log('TrainStatus schema already exists in Weaviate');
  }
};

// Store train status in Weaviate
export const storeTrainStatus = async (statusData: TrainStatus): Promise<void> => {
  if (!statusData) return;
  
  const client = getWeaviateClient();
  
  try {
    // Generate a UUID based on line and timestamp to avoid duplicates
    const id = `${statusData.line}-${Date.now()}`;
    
    // Store the object in Weaviate
    await client.data
      .creator()
      .withClassName('TrainStatus')
      .withId(id)
      .withProperties(statusData)
      .do();
    
    console.log(`Stored status data for line ${statusData.line} in Weaviate`);
  } catch (error) {
    console.error(`Error storing data for line ${statusData.line}:`, error);
    throw error;
  }
};

// Query train status from Weaviate
export const queryTrainStatus = async (line: string): Promise<TrainStatus | null> => {
  try {
    const client = getWeaviateClient();
    
    // Get the latest status for the specified line
    const result = await client.graphql
      .get()
      .withClassName('TrainStatus')
      .withFields('line timestamp status details hasDelay')
      .withWhere({
        operator: 'Equal',
        path: ['line'],
        valueString: line,
      })
      .withSort([{ path: ['timestamp'], order: 'desc' }])
      .withLimit(1)
      .do();
    
    if (result.data.Get.TrainStatus.length > 0) {
      return result.data.Get.TrainStatus[0] as TrainStatus;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error querying status for line ${line}:`, error);
    return null;
  }
};

// Query all lines with delays
export const queryDelayedLines = async (): Promise<TrainStatus[]> => {
  try {
    const client = getWeaviateClient();
    
    const result = await client.graphql
      .get()
      .withClassName('TrainStatus')
      .withFields('line details')
      .withWhere({
        operator: 'Equal',
        path: ['hasDelay'],
        valueBoolean: true,
      })
      .withSort([{ path: ['timestamp'], order: 'desc' }])
      .withLimit(20)
      .do();
    
    if (result.data.Get.TrainStatus) {
      return result.data.Get.TrainStatus as TrainStatus[];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error querying delayed lines:', error);
    return [];
  }
};