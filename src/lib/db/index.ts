// src/lib/db/index.ts
import { sql } from '@vercel/postgres';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';
import { Floor, Tag } from '@/lib/types';

// This promise will resolve once the DB is initialized.
let initializationPromise: Promise<void> | null = null;

async function initializeDatabase() {
  // If the promise already exists, just wait for it to finish
  if (initializationPromise) {
    return initializationPromise;
  }

  // Create a new promise and store it, so this code only runs once
  initializationPromise = (async () => {
    try {
      console.log('Running database initialization...');
      await sql`
        CREATE TABLE IF NOT EXISTS event_tags (
          id INTEGER PRIMARY KEY,
          tags_data JSONB NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS event_floors (
          id INTEGER PRIMARY KEY,
          floors_data JSONB NOT NULL
        );
      `;
      
      const tagsResult = await sql`SELECT 1 FROM event_tags WHERE id = 1;`;
      if (tagsResult.rowCount === 0) {
        await sql`INSERT INTO event_tags (id, tags_data) VALUES (1, ${JSON.stringify(initialTags)});`;
        console.log('Initial tags inserted into Postgres');
      }

      const floorsResult = await sql`SELECT 1 FROM event_floors WHERE id = 1;`;
      if (floorsResult.rowCount === 0) {
        await sql`INSERT INTO event_floors (id, floors_data) VALUES (1, ${JSON.stringify(initialFloors)});`;
        console.log('Initial floors inserted into Postgres');
      }
      console.log('Database initialization complete.');
    } catch (error) {
      console.error('Error initializing Postgres DB:', error);
      // We must throw here so the API call fails, otherwise it will try to use a non-existent table
      throw new Error(`Database initialization failed: ${error}`);
    }
  })();
  
  return initializationPromise;
}

export async function getFloors(): Promise<Floor[]> {
  try {
    await initializeDatabase(); // Wait for initialization
    const result = await sql`SELECT floors_data FROM event_floors WHERE id = 1;`;
    if (result.rowCount > 0) {
      return result.rows[0].floors_data as Floor[];
    }
    return initialFloors;
  } catch (error) {
    console.error('Failed to fetch floors from Postgres:', error);
    return initialFloors;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    await initializeDatabase(); // Wait for initialization
    const result = await sql`SELECT tags_data FROM event_tags WHERE id = 1;`;
    if (result.rowCount > 0) {
      return result.rows[0].tags_data as Tag[];
    }
    return initialTags;
  } catch (error) {
    console.error('Failed to fetch tags from Postgres:', error);
    return initialTags;
  }
}

export async function updateFloors(floors: Floor[]) {
  try {
    await initializeDatabase(); // Wait for initialization
    await sql`
      INSERT INTO event_floors (id, floors_data) 
      VALUES (1, ${JSON.stringify(floors)})
      ON CONFLICT (id) 
      DO UPDATE SET floors_data = ${JSON.stringify(floors)};
    `;
    return { success: true };
  } catch (error) {
    console.error('Error updating floors in Postgres:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTags(tags: Tag[]) {
  try {
    await initializeDatabase(); // Wait for initialization
    await sql`
      INSERT INTO event_tags (id, tags_data) 
      VALUES (1, ${JSON.stringify(tags)})
      ON CONFLICT (id) 
      DO UPDATE SET tags_data = ${JSON.stringify(tags)};
    `;
    return { success: true };
  } catch (error) {
    console.error('Error updating tags in Postgres:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
