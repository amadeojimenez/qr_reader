
require('dotenv').config({ path: '.env' });


const credentials = {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.NODE_ENV === 'production' ? process.env.DATABASE_NAME : process.env.DATABASE_NAME + '_test',
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    port: 5432,
}

module.exports = credentials;