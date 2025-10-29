// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: process.env.MYSQLPORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 10
// });

// // Test connection
// pool.getConnection()
//   .then(conn => {
//     console.log('✅ MySQL connected successfully');
//     conn.release();
//   })
//   .catch(err => console.error('❌ MySQL connection error:', err));

  

// module.exports = pool;

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.DATABASE_URL);

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => console.error('❌ MySQL connection error:', err));

module.exports = pool;