const pool = require('./config/db');
require('dotenv').config();

async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
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

    console.log('✅ Countries table created successfully!');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();