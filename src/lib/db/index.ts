// src/lib/db/index.ts
import { Floor, Tag } from '@/lib/types';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';

const FLOORS_KEY = 'eventmapper-floors';
const TAGS_KEY = 'eventmapper-tags';

// Helper function to get the Edge Config client only when needed
function getEdgeConfigClient() {
  try {
    if (process.env.EDGE_CONFIG) {
      // @ts-ignore
      const edgeConfigModule = require('@vercel/edge-config');
      if (edgeConfigModule.edgeConfig) {
        return { client: edgeConfigModule.edgeConfig, available: true };
      }
    }
  } catch (error) {
    console.error('Failed to load Edge Config module:', error);
  }
  return { client: null, available: false };
}

export async function initializeDatabase() {
  const { client, available } = getEdgeConfigClient();
  if (!available || !client) {
    console.log('Edge Config not configured or not available for initialization.');
    return;
  }

  try {
    console.log('Initializing Edge Config data...');
    const floorsExists = await client.get(FLOORS_KEY);
    if (!floorsExists) {
      await client.set(FLOORS_KEY, initialFloors);
      console.log('Initial floors data inserted');
    } else {
      console.log('Floors data already exists');
    }

    const tagsExists = await client.get(TAGS_KEY);
    if (!tagsExists) {
      await client.set(TAGS_KEY, initialTags);
      console.log('Initial tags data inserted');
    } else {
      console.log('Tags data already exists');
    }
    console.log('Edge Config initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Edge Config:', error);
  }
}

export async function getFloors(): Promise<Floor[]> {
  const { client, available } = getEdgeConfigClient();
  if (available && client) {
    try {
      const floors = await client.get<Floor[]>(FLOORS_KEY);
      if (floors) {
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
  const { client, available } = getEdgeConfigClient();
  if (available && client) {
    try {
      const tags = await client.get<Tag[]>(TAGS_KEY);
      if (tags) {
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
  const { client, available } = getEdgeConfigClient();
  if (available && client) {
    try {
      await client.set(FLOORS_KEY, floors);
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(floors) failed:', edgeError);
      return { success: false, error: 'Edge Config is not working properly. Please check your Vercel Edge Config setup.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
    };
  }
}

export async function updateTags(tags: Tag[]) {
  const { client, available } = getEdgeConfigClient();
  if (available && client) {
    try {
      await client.set(TAGS_KEY, tags);
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(tags) failed:', edgeError);
      return { success: false, error: 'Edge Config is not working properly. Please check your Vercel Edge Config setup.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data. Please contact the administrator to set up Edge Config in Vercel.' 
    };
  }
}
