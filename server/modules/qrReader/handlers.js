const debug = require('debug')('&:QR READER: handlers')
const services = require('./services'); 


const entradaEvento = async (req, res, next) => {
    try {
        const idUser = req.params.id
        const mayComeIn = await services.entradaEvento(idUser)
        res.send({status: mayComeIn});
    } catch (e) {
        debug('Error in handlers/entradaEvento ' + e);
        next(e); 
    }
};


const salidaEvento = async (req, res, next) => {
    try {
        const idUser = req.params.id
        const mayComeOut = await services.salidaEvento(idUser)
        res.send({status: mayComeOut});
    } catch (e) {
        debug('Error in handlers/salidaEvento ' + e);
        next(e); 
    }
};

module.exports = {
    entradaEvento,
    salidaEvento
}