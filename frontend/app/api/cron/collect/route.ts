import { NextRequest, NextResponse } from 'next/server';
import { collectAllTrainData } from '@/lib/statusManager';

// Secret key to protect the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'your-default-secret-key';

export async function GET(request: NextRequest) {
  // Check for secret key to protect endpoint
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.split(' ')[1] || request.nextUrl.searchParams.get('key');
  
  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Run data collection
    await collectAllTrainData();
    
    return NextResponse.json({
      success: true,
      message: 'Data collection completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error during data collection',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}