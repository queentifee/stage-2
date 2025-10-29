
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.DATABASE_URL);

pool.getConnection()
  .then(conn => {
    console.log(' MySQL connected successfully');
    conn.release();
  })
  .catch(err => console.error(' MySQL connection error:', err));

module.exports = pool;