const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const globalRouter = express();
const cookieParser = require('cookie-parser');
const debug = require('debug')('&:INDEX JS');
const jwtHelpers = require('./middleware/jwt.js');
// const cors = require('cors');
// const helmet = require('helmet'); //TODO: Implementar helmet



//JWT //TODO: Implementar JWT

//Logger // TODO: Implementar logger

const mainHandlers= require('./modules/main/handlers.js'); //TODO poiner los paths normal
const qrRouter = require('./modules/qrReader/router.js');


globalRouter.use(express.json());
globalRouter.use(express.urlencoded({ extended: false }));
globalRouter.use(cookieParser());

// Serving static files //TODO check
globalRouter.use(express.static('../client/inicio/src'));


globalRouter.get(['/','/login'], mainHandlers.getLogin);
globalRouter.post('/login', jwtHelpers.login);

globalRouter.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});
globalRouter.use(jwtHelpers.isUserAuthenticated);

globalRouter.get('/inicio', mainHandlers.getReader);
globalRouter.use('/qrReader', qrRouter);


// TODO error handling, 404 and logging

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
    console.log(`Servidor http corriendo en el puerto ${port}`);
});