const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'verge',
    password: 'Babatunde',
    port: 5432,
})

pool.on("connect", () =>{
    console.log("connected to db successfully");
});

pool.on("error", (err) =>{
    console.log("connected to db unsuccessfully", err);
})

module.exports = pool
