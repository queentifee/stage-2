const pool = require('./config/db'); // adjust path
require('dotenv').config();

async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL');

    // Drop the old table
    await connection.query('DROP TABLE IF EXISTS countries');
    console.log('🗑️  Old table dropped');

    await connection.query(`
      CREATE TABLE countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        name_normalized VARCHAR(255) UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(100),
        population BIGINT,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(15,6),
        estimated_gdp DECIMAL(20,2),
        flag_url TEXT,
        last_refreshed_at DATETIME
      )
    `);

    console.log('✅ Countries table created with name_normalized!');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();