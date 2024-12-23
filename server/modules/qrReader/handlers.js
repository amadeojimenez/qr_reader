const debug = require('debug')('&:QR READER: handlers')
const services = require('./services'); 


const entradaEvento = async (req, res, next) => {
    try {
        const uniqueHash = req.body.uniqueHash
        const idUser = req.params.id
        const mayComeIn = await services.entradaEvento(idUser, uniqueHash)
        res.send({status: mayComeIn});
    } catch (e) {
        debug('Error in handlers/entradaEvento ' + e);
        next(e); 
    }
};


const salidaEvento = async (req, res, next) => {
    try {
        const uniqueHash = req.body.uniqueHash
        const idUser = req.params.id
        const mayComeOut = await services.salidaEvento(idUser, uniqueHash)
        res.send({status: mayComeOut});
    } catch (e) {
        debug('Error in handlers/salidaEvento ' + e);
        next(e); 
    }
};

const record = async (req, res, next) => {
    try {
        const { uniqueHash, idUser, idDevice, inOrOut } = req.body;
        await services.record(idUser, uniqueHash, idDevice, inOrOut);
        res.send();
    } catch (e) {
        debug('Error in handlers/salidaEvento ' + e);
        next(e); 
    }
}

const insertLocalStorageIntoDB = async (req, res, next) => {
    try {
        const offlineQrData = req.body; 

        if (!Array.isArray(offlineQrData)) {
            return res.status(400).send({ status: 'error', message: 'QRdata no válida.' });
        }

        await services.insertLocalStorageIntoDB(offlineQrData);
        const updatedDatabase = await services.getUpdatedDatabase(); 
       
        res.send(updatedDatabase);
    } catch (e) {
        debug('Error in handlers/insertLocalStorageIntoDB ' + e);
        next(e);
    }
};

const getUpdatedDatabase = async (req, res, next) => {
    try {
        
        const updatedDatabase = await services.getUpdatedDatabase();

        res.send(updatedDatabase);
    } catch (e) {
        debug('Error in handlers/getUpdatedDatabase ' + e);
        next(e);
    }
};

module.exports = {
    entradaEvento,
    salidaEvento,
    insertLocalStorageIntoDB,
    getUpdatedDatabase,
    record
}