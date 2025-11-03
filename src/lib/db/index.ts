// src/lib/db/index.ts
import { Floor, Tag } from '@/lib/types';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';

// Helper to get the client
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

// Helper function to get the full data store
// This will return the initial data if the store is empty
async function getFullStore(client: any) {
  let storeData = await client.get();
  // Check if store is empty or doesn't have our keys
  if (!storeData || !storeData.floors || !storeData.tags) {
    console.log('Store is empty or malformed, returning initial data');
    // This is the structure we will save in Vercel
    return { floors: initialFloors, tags: initialTags };
  }
  return storeData;
}

export async function getFloors(): Promise<Floor[]> {
  const { client, available } = await getEdgeConfigClient();
  if (available && client) {
    try {
      // Get the entire store, then return just the 'floors' part
      const store = await getFullStore(client);
      return store.floors;
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
      // Get the entire store, then return just the 'tags' part
      const store = await getFullStore(client);
      return store.tags;
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
      // Read-Modify-Write: Get the whole store
      const currentStore = await getFullStore(client);
      // Modify just the 'floors' part
      currentStore.floors = floors;
      // Save the whole store back
      await client.set(currentStore);
      console.log('Successfully updated floors in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(floors) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed.' };
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
      // Read-Modify-Write: Get the whole store
      const currentStore = await getFullStore(client);
      // Modify just the 'tags' part
      currentStore.tags = tags;
      // Save the whole store back
      await client.set(currentStore);
      console.log('Successfully updated tags in Edge Config');
      return { success: true };
    } catch (edgeError) {
      console.error('Edge Config set(tags) failed:', edgeError);
      return { success: false, error: 'Edge Config set operation failed.' };
    }
  } else {
    return { 
      success: false, 
      error: 'Data persistence is not available. Edge Config is required for saving data.' 
    };
  }
}
