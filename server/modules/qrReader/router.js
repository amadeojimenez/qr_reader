const express = require('express');
const qrReaderHandlers = require('./handlers.js');
const qrRouter = express.Router({ mergeParams: true });



qrRouter.post('/in/:id', qrReaderHandlers.entradaEvento);
// response.status:  ok, was_out, already_in, invalid_id

qrRouter.post('/out/:id', qrReaderHandlers.salidaEvento);
// response.status: not_in, was_in, already_out, invalid_id

qrRouter.post('*', (req, res) => {
    debug('Error in handlers/entradaEvento ' + e);
    res.status(404).send('Not found');
}   );
		
module.exports = qrRouter;
