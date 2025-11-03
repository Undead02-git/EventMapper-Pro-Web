import { NextResponse } from 'next/server';
import { getTags, updateTags } from '@/lib/db';

export async function GET() {
  try {
    console.log('GET /api/tags called');
    const tags = await getTags();
    console.log('Successfully fetched tags');
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error in GET /api/tags:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tags', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/tags called');
    const tags = await request.json();
    console.log('Received tags data');
    const result = await updateTags(tags);
    
    if (result.success) {
      console.log('Successfully updated tags');
      return NextResponse.json({ message: 'Tags updated successfully' });
    } else {
      console.error('Failed to update tags:', result.error);
      return NextResponse.json({ 
        error: 'Failed to update tags', 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/tags:', error);
    return NextResponse.json({ 
      error: 'Failed to update tags', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }

}

