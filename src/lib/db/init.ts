import { sql } from '@vercel/postgres';
import { floors, tags } from '@/lib/initial-data';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create floors table
    await sql`
      CREATE TABLE IF NOT EXISTS floors (
        id SERIAL PRIMARY KEY,
        floor_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Floors table created or already exists');

    // Create tags table
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        tags_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Tags table created or already exists');

    // Check if we have initial data
    const floorResult = await sql`SELECT COUNT(*) FROM floors;`;
    const tagResult = await sql`SELECT COUNT(*) FROM tags;`;

    // If no data exists, insert initial data
    if (floorResult.rows[0].count === '0') {
      await sql`INSERT INTO floors (floor_data) VALUES (${JSON.stringify(floors)});`;
      console.log('Initial floors data inserted');
    } else {
      console.log('Floors data already exists');
    }

    if (tagResult.rows[0].count === '0') {
      await sql`INSERT INTO tags (tags_data) VALUES (${JSON.stringify(tags)});`;
      console.log('Initial tags data inserted');
    } else {
      console.log('Tags data already exists');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization script failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;