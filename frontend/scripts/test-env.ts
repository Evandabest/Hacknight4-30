import * as dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

console.log('Environment Variable Test');
console.log('========================');
console.log('WEAVIATE_SCHEME:', process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'Not set');
console.log('WEAVIATE_HOST:', process.env.WEAVIATE_HOST || 'Not set');
console.log('WEAVIATE_API_KEY:', process.env.WEAVIATE_API_KEY ? '***SET (hidden for security)***' : 'Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '***SET (hidden for security)***' : 'Not set');
console.log('CRON_SECRET:', process.env.CRON_SECRET ? '***SET (hidden for security)***' : 'Not set');