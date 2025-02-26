const { Pool } = require('pg');
const dotenv = require('dotenv')

dotenv.config();

const pool = new Pool({
   user : process.env.USER,
   host : process.env.HOST,

   database : process.env.DATABASE,
   password : process.env.PASSWORD,
   port : process.env.DB_PORT,
})

// const pool = new Pool({
//    connectionString: process.env.POSTGRES_URL + "?sslmode=require",
//    ssl: { rejectUnauthorized: false }
//  })
 
//  pool.connect()
//   .then(() => console.log("Connected to PostgreSQL"))
//   .catch(err => console.error("Connection error", err));

module.exports = pool;
