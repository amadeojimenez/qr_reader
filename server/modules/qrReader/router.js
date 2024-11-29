const express = require('express');
const qrReaderHandlers = require('@qrReader/handlers');

const qrRouter = express.Router();



qrRouter.post('/entrada', qrReaderHandlers.entradaEvento);

qrRouter.post('/salida', qrReaderHandlers.salidaEvento);

		
module.exports = qrRouter;
