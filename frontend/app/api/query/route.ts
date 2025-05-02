import { NextRequest, NextResponse } from 'next/server';
import { processQuery } from '@/lib/statusManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json({
        success: false,
        message: 'Query is required'
      }, { status: 400 });
    }
    
    const response = await processQuery(query);
    
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while processing query'
    }, { status: 500 });
  }
}