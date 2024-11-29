const debug = require('debug')('&:QR READER: handlers')


const entradaEvento = async (req, res, next) => {
    try {
        const {qr_data} = req.body
        console.log(qr_data,'dataaa')
        res.send({status:'approved'});
    } catch (e) {
        debug('Error in handlers/entradaEvento ' + e);
        next(e); 
    }
};


const salidaEvento = async (req, res, next) => {
    try {
        const {qr_data} = req.body
        console.log(qr_data,'dataaa')
        res.send({status:'denied'});
    } catch (e) {
        debug('Error in handlers/salidaEvento ' + e);
        next(e); 
    }
};

module.exports = {
    entradaEvento,
    salidaEvento
}