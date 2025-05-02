import { NextRequest, NextResponse } from 'next/server';
import { queryTrainStatus } from '@/lib/weaviate';
import { scrapeTrainStatus } from '@/lib/scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: { line: string } }
) {
  try {
    const line = params.line.toUpperCase();
    
    // First try to get the latest status from Weaviate
    let status = await queryTrainStatus(line);
    
    // If no status found or if it's older than 10 minutes, scrape new data
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    if (!status || (status.timestamp < tenMinutesAgo)) {
      const freshStatus = await scrapeTrainStatus(line);
      if (freshStatus) {
        status = freshStatus;
      }
    }
    
    if (status) {
      return NextResponse.json({
        success: true,
        data: status
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `No data found for line ${line}`
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while fetching train status'
    }, { status: 500 });
  }
}