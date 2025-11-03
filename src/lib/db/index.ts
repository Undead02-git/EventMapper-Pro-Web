// src/lib/db/index.ts
import { sql } from '@vercel/postgres';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';
import { Floor, Tag } from '@/lib/types';

// Helper to create tables if they don't exist
async function initializeDatabase() {
  try {
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
    
    // Check if data exists, if not, insert it.
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
  } catch (error) {
    console.error('Error initializing Postgres DB:', error);
  }
}

// Run initialization. This is safe to run on every cold boot.
initializeDatabase();

export async function getFloors(): Promise<Floor[]> {
  try {
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
