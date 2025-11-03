// src/lib/db/index.ts
import { Floor, Tag } from '@/lib/types';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';

const FLOORS_KEY = 'eventmapper-floors';
const TAGS_KEY = 'eventmapper-tags';

// Helper function to get the Edge Config client only when needed
async function getEdgeConfigClient() {
  try {
    if (process.env.EDGE_CONFIG) {
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

export async function getFloors(): Promise<Floor[]> {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      // Get the wrapper object, then return the .data array
      const result = await client.get<{ data: Floor[] }>(FLOORS_KEY);
      if (result && result.data) {
        console.log('Fetched floors from Edge Config');
        return result.data;
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
      // Get the wrapper object, then return the .data array
      const result = await client.get<{ data: Tag[] }>(TAGS_KEY);
      if (result && result.data) {
        console.log('Fetched tags from Edge Config');
        return result.data;
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
      // Wrap the floors array in a 'data' object before saving
      await client.set(FLOORS_KEY, { data: floors });
      console.log('Successfully updated floors in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(floors) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed. Check Vercel logs.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data.' 
    };
  }
}

export async function updateTags(tags: Tag[]) {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      // Wrap the tags array in a 'data' object before saving
      await client.set(TAGS_KEY, { data: tags });
      console.log('Successfully updated tags in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(tags) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed. Check Vercel logs.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data.' 
    };
  }
}
