const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const globalRouter = express();
const cookieParser = require('cookie-parser');
const debug = require('debug')('&:INDEX JS');
const jwtHelpers = require('./middleware/jwt.js');
const { privateLogger, errorsLogger } = require('./middleware/logger.js');
const favicon = require('serve-favicon');
// const cors = require('cors');
// const helmet = require('helmet'); //TODO: Implementar helmet

globalRouter.use(express.json({ limit: '50mb' })); //POr si pasa lo de entity too large, (eso fue con 1418 entries en LocalStoragex)


const mainHandlers= require('./modules/main/handlers.js'); 
const qrRouter = require('./modules/qrReader/router.js');


globalRouter.use(express.json());
globalRouter.use(express.urlencoded({ extended: false }));
globalRouter.use(cookieParser());

globalRouter.use(favicon(path.join(__dirname, '../client/inicio/src/img', 'favicon.ico')))
globalRouter.use(express.static('../client/inicio/src'));


globalRouter.use(privateLogger)


globalRouter.get(['/','/login'], mainHandlers.getLogin);
globalRouter.post('/login', jwtHelpers.login);

globalRouter.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});
globalRouter.use(jwtHelpers.isUserAuthenticated);

globalRouter.get('/favicon.ico', (req, res) => {
    res.status(204);
}   
);
globalRouter.get('/inicio', mainHandlers.getReader);
globalRouter.use('/qrReader', qrRouter);


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