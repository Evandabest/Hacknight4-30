import { NextRequest, NextResponse } from 'next/server';
import { scrapeTrainStatus } from '@/lib/scraper';
import { storeTrainStatus } from '@/lib/weaviate';

export async function POST(
  request: NextRequest,
  { params }: { params: { line: string } }
) {
  try {
    const line = params.line.toUpperCase();
    
    // Scrape fresh data for the specified line
    const statusData = await scrapeTrainStatus(line);
    
    if (statusData) {
      // Store in Weaviate
      await storeTrainStatus(statusData);
      
      return NextResponse.json({
        success: true,
        data: statusData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to scrape data for line ${line}`
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while updating train status'
    }, { status: 500 });
  }
}