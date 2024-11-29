const path = require('path');
const fs = require('fs');
const dbCredentials = require('./config/config.js');


console.log(dbCredentials)

const knex = require('knex')(
    {
        client: 'pg',
        version: '5.7',
        connection: {
            host: dbCredentials.host,
            port: 5432,
            user: dbCredentials.username,
            password: dbCredentials.password,
            database: dbCredentials.database,
        }
    }
)



module.exports = { knex }
