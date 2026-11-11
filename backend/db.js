const { Pool, types } = require("pg");
require("dotenv").config();

// PostgreSQL NUMERIC (price) string-ah varum; number-ah maatrom
types.setTypeParser(1700, (value) => parseFloat(value));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;