const path = require('path');
const fs = require('fs');

// const certPath = path.resolve(__dirname, 'certificate_Bundle_AWS/eu-north-1-bundle.pem');


const dbCredentials = {
    host: process.env.DATABASE_HOST,
    port: 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres'
}



const knex = require('knex')(
    {
    client: 'pg',
    version: '5.7',
    connection: {
        host: dbCredentials.host,
        port: 5432,
        user: dbCredentials.user,
        password: dbCredentials.password,
        database: dbCredentials.database,
        // ssl: {
        //     require: true,
        //     rejectUnauthorized: true,
        //     ca: fs.readFileSync(certPath).toString(),
        // }
    }
})


module.exports = { knex }
