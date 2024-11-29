require('dotenv').config({ path: '../../.env' });
const path = require('path');
const fs = require('fs');

// const certPath = path.resolve(__dirname, '../certificate_Bundle_AWS/eu-north-1-bundle.pem');




module.exports = {
    development: {
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
        dialect: 'postgres',
    },
    // production: {
    //     username: process.env.DATABASE_USER,
    //     password: process.env.DATABASE_PASSWORD,
    //     database: process.env.DATABASE_NAME,
    //     host: process.env.DATABASE_HOST,
    //     dialect: 'postgres',
    //     dialectOptions: {
    //         ssl: {
    //             require: true,
    //             rejectUnauthorized: true,
    //             ca: fs.readFileSync(certPath).toString(),
    //         }
    //     }
    // }
};