const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();


const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString
    // user: 'postgres',
    // host: 'localhost',
    // database: 'verge',
    // password: 'Babatunde',
    // port: 5432,
})



pool.on("connect", () =>{
    console.log("connected to db successfully");
});

pool.on("error", (err) =>{
    console.log("connected to db unsuccessfully", err);
})

module.exports = pool
