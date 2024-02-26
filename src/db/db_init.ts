import { Pool } from 'pg'

export default new Pool({
  connectionString : process.env.DB_CONNECTION_URI,
  // host: process.env.DB_HOSTNAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database : process.env.DB_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})