const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./models/schema.js');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

module.exports = { pool, db };