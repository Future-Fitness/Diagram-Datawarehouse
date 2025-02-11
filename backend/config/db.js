const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION
});

module.exports = s3;
