import { NextResponse } from 'next/server';
import { getFloors, updateFloors } from '@/lib/db';

export async function GET() {
  try {
    console.log('GET /api/floors called');
    const floors = await getFloors();
    console.log('Successfully fetched floors');
    return NextResponse.json(floors);
  } catch (error) {
    console.error('Error in GET /api/floors:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch floors', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/floors called');
    const floors = await request.json();
    console.log('Received floors data');
    const result = await updateFloors(floors);
    
    if (result.success) {
      console.log('Successfully updated floors');
      return NextResponse.json({ message: 'Floors updated successfully' });
    } else {
      console.error('Failed to update floors:', result.error);
      return NextResponse.json({ 
        error: 'Failed to update floors', 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/floors:', error);
    return NextResponse.json({ 
      error: 'Failed to update floors', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}