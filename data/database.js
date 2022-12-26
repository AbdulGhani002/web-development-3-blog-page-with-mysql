const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  database: 'blog_database',
  user: 'root',
  password: '12345'
});

module.exports = pool;