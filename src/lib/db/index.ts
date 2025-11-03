// Use dynamic import to avoid TypeScript issues and runtime errors
let edgeConfig: any = null;
let edgeConfigAvailable = false;

// Try to import and initialize edgeConfig
try {
  if (process.env.EDGE_CONFIG) {
    // @ts-ignore
    const edgeConfigModule = require('@vercel/edge-config');
    edgeConfig = edgeConfigModule.edgeConfig;
    edgeConfigAvailable = !!edgeConfig;
    console.log('Edge Config module loaded successfully');
  } else {
    console.log('EDGE_CONFIG environment variable not set');
  }
} catch (error) {
  console.log('Edge Config not available or failed to load:', error);
}

// Keys for Edge Config
const FLOORS_KEY = 'eventmapper-floors';
const TAGS_KEY = 'eventmapper-tags';

// Check if we're running on the server or client
const isServer = typeof window === 'undefined';

export async function initializeDatabase() {
  try {
    // Check if Edge Config environment variables are set and available
    const hasEdgeConfig = process.env.EDGE_CONFIG && edgeConfigAvailable;
    
    if (!hasEdgeConfig) {
      console.log('Edge Config not configured or not available.');
      return;
    }

    console.log('Initializing Edge Config data...');
    
    // Check if we have initial data
    const floorsExists = await edgeConfig.get(FLOORS_KEY);
    const tagsExists = await edgeConfig.get(TAGS_KEY);

    // If no data exists, insert initial data
    if (!floorsExists) {
      const { floors } = await import('@/lib/initial-data');
      await edgeConfig.set(FLOORS_KEY, floors);
      console.log('Initial floors data inserted');
    } else {
      console.log('Floors data already exists');
    }

    if (!tagsExists) {
      const { tags } = await import('@/lib/initial-data');
      await edgeConfig.set(TAGS_KEY, tags);
      console.log('Initial tags data inserted');
    } else {
      console.log('Tags data already exists');
    }

    console.log('Edge Config initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Edge Config:', error);
  }
}

export async function getFloors() {
  try {
    // Check if Edge Config is available
    const hasEdgeConfig = process.env.EDGE_CONFIG && edgeConfigAvailable;
    
    if (hasEdgeConfig) {
      try {
        const floors = await edgeConfig.get(FLOORS_KEY);
        if (floors) {
          return floors;
        }
      } catch (edgeError) {
        console.error('Edge Config get failed:', edgeError);
      }
    }
    
    // Return initial data as fallback
    const { floors } = await import('@/lib/initial-data');
    return floors;
  } catch (error) {
    console.error('Error fetching floors:', error);
    // Return initial data as fallback
    const { floors } = await import('@/lib/initial-data');
    return floors;
  }
}

export async function getTags() {
  try {
    // Check if Edge Config is available
    const hasEdgeConfig = process.env.EDGE_CONFIG && edgeConfigAvailable;
    
    if (hasEdgeConfig) {
      try {
        const tags = await edgeConfig.get(TAGS_KEY);
        if (tags) {
          return tags;
        }
      } catch (edgeError) {
        console.error('Edge Config get failed:', edgeError);
      }
    }
    
    // Return initial data as fallback
    const { tags } = await import('@/lib/initial-data');
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return initial data as fallback
    const { tags } = await import('@/lib/initial-data');
    return tags;
  }
}

export async function updateFloors(floors: any) {
  try {
    // Check if Edge Config is available
    const hasEdgeConfig = process.env.EDGE_CONFIG && edgeConfigAvailable;
    
    if (hasEdgeConfig) {
      try {
        await edgeConfig.set(FLOORS_KEY, floors);
        return { success: true };
      } catch (edgeError) {
        console.error('Edge Config set failed:', edgeError);
        return { success: false, error: 'Edge Config is not working properly. Please check your Vercel Edge Config setup.' };
      }
    } else {
      // Without Edge Config, we cannot save on the server
      // Return a specific error message
      return { 
        success: false, 
        error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
      };
    }
  } catch (error) {
    console.error('Error updating floors:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTags(tags: any) {
  try {
    // Check if Edge Config is available
    const hasEdgeConfig = process.env.EDGE_CONFIG && edgeConfigAvailable;
    
    if (hasEdgeConfig) {
      try {
        await edgeConfig.set(TAGS_KEY, tags);
        return { success: true };
      } catch (edgeError) {
        console.error('Edge Config set failed:', edgeError);
        return { success: false, error: 'Edge Config is not working properly. Please check your Vercel Edge Config setup.' };
      }
    } else {
      // Without Edge Config, we cannot save on the server
      // Return a specific error message
      return { 
        success: false, 
        error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
      };
    }
  } catch (error) {
    console.error('Error updating tags:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
