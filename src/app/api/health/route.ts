import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Edge Config environment variables are set
    const hasEdgeConfig = process.env.EDGE_CONFIG;
    
    if (!hasEdgeConfig) {
      return NextResponse.json({ 
        status: 'ok', 
        storage: 'not_configured', 
        message: 'Edge Config environment variable not set. Using localStorage fallback.' 
      });
    }
    
    // Try to test Edge Config connection
    try {
      // @ts-ignore
      const edgeConfig = require('@vercel/edge-config').edgeConfig;
      if (edgeConfig) {
        // Simple test to see if we can access Edge Config
        await edgeConfig.get('test-key');
        return NextResponse.json({ 
          status: 'ok', 
          storage: 'edge_config_connected',
          message: 'Edge Config is configured and connected successfully.'
        });
      } else {
        return NextResponse.json({ 
          status: 'ok', 
          storage: 'edge_config_configured_but_unavailable',
          message: 'Edge Config is configured but not available. Falling back to localStorage.',
          warning: 'Check your Edge Config setup in Vercel dashboard.'
        });
      }
    } catch (edgeConfigError) {
      return NextResponse.json({ 
        status: 'ok', 
        storage: 'edge_config_configured_but_error',
        message: 'Edge Config is configured but connection failed. Falling back to localStorage.',
        error: edgeConfigError instanceof Error ? edgeConfigError.message : 'Unknown error',
        warning: 'Check your Edge Config setup in Vercel dashboard.'
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'ok', 
      storage: 'error', 
      message: 'Error checking Edge Config configuration.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}