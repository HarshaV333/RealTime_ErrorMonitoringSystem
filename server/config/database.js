const mysql = require('mysql2/promise');

require('dotenv').config();

// console.log(process.env.db_host, process.env.db_user, process.env.db_password, process.env.db_database)
const pool = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database
});

module.exports = pool;