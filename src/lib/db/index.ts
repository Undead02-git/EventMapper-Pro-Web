// src/lib/db/index.ts
import { Floor, Tag } from '@/lib/types';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';

const FLOORS_KEY = 'eventmapper-floors';
const TAGS_KEY = 'eventmapper-tags';

// Helper function to get the Edge Config client only when needed
async function getEdgeConfigClient() {
  try {
    if (process.env.EDGE_CONFIG) {
      // Use dynamic import() for better compatibility
      const edgeConfigModule = await import('@vercel/edge-config');
      const client = edgeConfigModule.edgeConfig;
      if (client) {
        return { client, available: true };
      }
    }
  } catch (error) {
    console.error('Failed to load Edge Config module:', error);
  }
  return { client: null, available: false };
}

export async function initializeDatabase() {
  const { client, available } = await getEdgeConfigClient();
  if (!available || !client) {
    console.log('Edge Config not configured or not available for initialization.');
    return;
  }

  try {
    console.log('Initializing Edge Config data...');
    const floorsExists = await client.get(FLOORS_KEY);
    if (!floorsExists) {
      await client.set(FLOORS_KEY, initialFloors);
      console.log('Initial floors data inserted into Edge Config');
    } else {
      console.log('Floors data already exists in Edge Config');
    }

    const tagsExists = await client.get(TAGS_KEY);
    if (!tagsExists) {
      await client.set(TAGS_KEY, initialTags);
      console.log('Initial tags data inserted into Edge Config');
    } else {
      console.log('Tags data already exists in Edge Config');
    }
    console.log('Edge Config initialization completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing Edge Config:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getFloors(): Promise<Floor[]> {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      const floors = await client.get<Floor[]>(FLOORS_KEY);
      if (floors) {
        console.log('Fetched floors from Edge Config');
        return floors;
      }
    } catch (edgeError) {
      console.error('Edge Config getFloors failed:', edgeError);
    }
  }
  
  console.log('Falling back to initial-data for floors');
  return initialFloors;
}

export async function getTags(): Promise<Tag[]> {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      const tags = await client.get<Tag[]>(TAGS_KEY);
      if (tags) {
        console.log('Fetched tags from Edge Config');
        return tags;
      }
    } catch (edgeError) {
      console.error('Edge Config getTags failed:', edgeError);
    }
  }

  console.log('Falling back to initial-data for tags');
  return initialTags;
}

export async function updateFloors(floors: Floor[]) {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      await client.set(FLOORS_KEY, floors);
      console.log('Successfully updated floors in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(floors) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed. Check Vercel logs.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
    };
  }
}

export async function updateTags(tags: Tag[]) {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      await client.set(TAGS_KEY, tags);
      console.log('Successfully updated tags in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(tags) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed. Check Vercel logs.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
    };
  }
}
