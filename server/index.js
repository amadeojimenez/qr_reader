const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const globalRouter = express();
const debug = require('debug')('&:INDEX JS');
// const cors = require('cors');
// const helmet = require('helmet'); //TODO: Implementar helmet



//JWT //TODO: Implementar JWT

//Logger // TODO: Implementar logger

const mainHandlers= require(path.join(__dirname, 'modules/main/handlers.js'));
const qrRouter = require(path.join(__dirname, 'modules/qrReader/router.js'));


globalRouter.use(express.json());
globalRouter.use(express.urlencoded({ extended: false }));

// Serving static files //TODO check
globalRouter.use(express.static(path.join(__dirname, '../client/inicio/src')));




//---------------------- Other routers--------------------------

globalRouter.get('/', mainHandlers.getReader);
globalRouter.put('/login', mainHandlers.login);


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