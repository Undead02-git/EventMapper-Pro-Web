// src/app/api/init-db/route.ts
import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  console.log('GET /api/init-db called');
  try {
    const result = await initializeDatabase();
    if (result?.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Database initialization complete. Check your Edge Config store.' 
      });
    } else {
      return NextResponse.json({ 
        status: 'warning', 
        message: 'Initialization may have failed or was not needed. Check logs.',
        details: result?.error 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to initialize database.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Re-validate this route to ensure it's not cached
export const revalidate = 0;
