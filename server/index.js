const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const globalRouter = express();
const cookieParser = require('cookie-parser');
const debug = require('debug')('&:INDEX JS');
const jwtHelpers = require('./middleware/jwt.js');
const { privateLogger, errorsLogger } = require('./middleware/logger.js');
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

globalRouter.use(privateLogger)


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
globalRouter.use('*', (req, res, next) => {
    const err = new Error('Not found');
    next(err);
});

globalRouter.use(errorsLogger);

globalRouter.use((err, req, res, next) => {
    debug('Error in globalRouter ' + err);
    res.status(404).send('No');
});


const port = process.env.PORT || 5050;

globalRouter.listen(port, async () => {
    console.log(`Servidor http corriendo en el puerto ${port}`);
});