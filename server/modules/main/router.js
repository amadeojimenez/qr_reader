const express = require('express');
const mainHandlers = require('handlers');

const mainRouter = express.Router();



qrRouter.get('/', mainHandlers.getReader);
qrRouter.post('/login', mainHandlers.login);

		
module.exports = mainRouter;
