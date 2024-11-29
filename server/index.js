const path = require('path');
require('./aliases');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const globalRouter = express();
// const cors = require('cors');
// const helmet = require('helmet');

// Middleware session cookie en el navegador
// const session = require("express-session");

// const { passport, isLoggedIn } = require('@auth/helpers/passportStrategies');

//-----------------UNCOMMENT--------------------------------
const { connectToDatabase, syncDatabase } = require('@db/connection.js');

const debug = require('debug')('&:INDEX JS');

// Sub routers

const qrReaderRouter = require('@qrReader/router.js');


globalRouter.use(express.json());
globalRouter.use(express.urlencoded({ extended: false }));

//------------------ CORS----------------------------------------------

// const corsOptions = {
//     origin: ['https://myetsidi.com', 'https://calendar.myetsidi.com', 'http://localhost:3000',],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//     optionsSuccessStatus: 204
//   };
  
// globalRouter.use(cors(corsOptions));

//-------------------- HELMET------------------------------------------------

// switch (process.env.NODE_ENV) {
//     case 'development': {
//         console.log('\x1b[31m%s\x1b[0m', 'Not using helmet in development');
//         break;
//     }
//     case 'production':
//         console.log('\x1b[33m%s\x1b[0m', 'Using helmet in production environment');
//         globalRouter.use(helmet({
//             referrerPolicy: { policy: 'no-referrer' },
//             contentSecurityPolicy: {
//                 directives: {
//                     defaultSrc: ["'self'",'https://*.googleapis.com', 'https://ka-f.fontawesome.com'],
//                     scriptSrc: ["'self'", 'https://*.myetsidi.com', 'https://*.googleapis.com','https://apis.google.com', 'https://www.google.com/','https://cdn.jsdelivr.net','https://cdnjs.cloudflare.com','https://kit.fontawesome.com','https://unpkg.com'],
//                     objectSrc: ["'none'"],
//                     baseUri: ["'none'"],
//                     formAction: ["'none'"],
//                     frameAncestors: ["'none'"],
//                 },
//             },
//             hidePoweredBy: true, //Remove the X-Powered-By header which can reveal information about the server
//             noSniff: true, //Prevent browsers from MIME-sniffing a response away from the declared content type
//             frameguard: { //Prevent clickjacking attacks by ensuring that the content is not embedded in a frame
//             action: 'deny'
//             },
//             xssFilter: true, //prevent reflected XSS attacks
//         }));
//         break;
//     default:
//         console.log('No environment provided');
//     }

//-------------------------- Cookies session---------------------------------------------

// if (process.env.NODE_ENV === 'development') {
//     const pgSession = require('connect-pg-simple')(session);
//     const sessionPool = require('pg').Pool;
//     const sessionDBaccess = new sessionPool({
//         user: process.env.DATABASE_USER,
//         password: process.env.DATABASE_PASSWORD,
//         host: process.env.DATABASE_HOST,
//         port: 5432,
//         database: process.env.DATABASE_SESSION
//     });

//     globalRouter.use(
//         session({
//             store: new pgSession({
//                 pool: sessionDBaccess,
//                 tableName: 'dev_sessions',
//                 createTableIfMissing: true,
//                 pruneSessionInterval: false
//             }),
//             secret: process.env.COOKIE_SECRET,
//             cookie: { maxAge: 86400000, secure: false, sameSite: 'lax', httpOnly: true },
//             resave: false,
//             saveUninitialized: false
//         })
//     );
// } else if (process.env.NODE_ENV === 'production') {
//     // Store for the cookie
//     const {redisClient} = require('@utils/redisClient.js');
//     const RedisStore = require('connect-redis').default 
   
//     const store = new RedisStore({ client: redisClient })

//     globalRouter.use(session({
//         name: 'session',
//         store,
//         secret: process.env.COOKIE_SECRET,
//         resave: false,
//         saveUninitialized: false,
//         proxy: true,
//         cookie: {
//             secure: true,
//             maxAge: 86400000 * 7, // 24h * 7
//             httpOnly: true,
//             sameSite: 'lax',
//             name: 'sessionId'
//         }
//     }))
// }

// globalRouter.use(passport.initialize());
// globalRouter.use(passport.session());

// Serving static files
globalRouter.use(express.static(path.join(__dirname, '../client/inicio/src')));


globalRouter.get(['/'], (req, res, next) => {
    try {
        const file = 'inicio.html';
        res.sendFile(file, { root: path.join(__dirname, '../client/inicio') }, function (err) {
            if (err) {
                console.log(err);
            }
        });
    } catch (err) {
        console.log(err, 'error');
    }
});


//---------------------- Other routers--------------------------

globalRouter.use('/qrReader', qrReaderRouter);


// globalRouter.all('*', (req, res) => {
// 	try {
//         const file = 'errorPage.html';
//         res.sendFile(file, { root: path.join(__dirname, '../client/errorPage') }, function (err) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     } catch (err) {
//         console.log(err, 'error');
//     }
// });


const port = process.env.PORT || 5050;

globalRouter.listen(port, async () => {
    await connectToDatabase();
    await syncDatabase();
    console.log(`Servidor http corriendo en el puerto ${port}`);
});