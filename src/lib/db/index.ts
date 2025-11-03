// src/lib/db/index.ts
import { Pool } from 'pg';
import { floors as initialFloors, tags as initialTags } from '@/lib/initial-data';
import { Floor, Tag } from '@/lib/types';

// Create a new pool. It will automatically find and use
// the POSTGRES_URL environment variable you set in Vercel.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // This is required for Vercel functions to connect to Supabase
  ssl: {
    rejectUnauthorized: false
  }
});

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
      console.log('Running database initialization with pg...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS event_tags (
          id INTEGER PRIMARY KEY,
          tags_data JSONB NOT NULL
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS event_floors (
          id INTEGER PRIMARY KEY,
          floors_data JSONB NOT NULL
        );
      `);
      
      const tagsResult = await pool.query('SELECT 1 FROM event_tags WHERE id = 1;');
      if (tagsResult.rowCount === 0) {
        await pool.query('INSERT INTO event_tags (id, tags_data) VALUES (1, $1)', [JSON.stringify(initialTags)]);
        console.log('Initial tags inserted into Postgres');
      }

      const floorsResult = await pool.query('SELECT 1 FROM event_floors WHERE id = 1;');
      if (floorsResult.rowCount === 0) {
        await pool.query('INSERT INTO event_floors (id, floors_data) VALUES (1, $1)', [JSON.stringify(initialFloors)]);
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
    const result = await pool.query('SELECT floors_data FROM event_floors WHERE id = 1;');
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
    const result = await pool.query('SELECT tags_data FROM event_tags WHERE id = 1;');
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
    await pool.query(`
      INSERT INTO event_floors (id, floors_data) 
      VALUES (1, $1)
      ON CONFLICT (id) 
      DO UPDATE SET floors_data = $1;
    `, [JSON.stringify(floors)]);
    return { success: true };
  } catch (error) {
    console.error('Error updating floors in Postgres:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateTags(tags: Tag[]) {
  try {
    await initializeDatabase(); // Wait for initialization
    await pool.query(`
      INSERT INTO event_tags (id, tags_data) 
      VALUES (1, $1)
      ON CONFLICT (id) 
      DO UPDATE SET tags_data = $1;
    `, [JSON.stringify(tags)]);
    return { success: true };
  } catch (error) {
    console.error('Error updating tags in Postgres:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
