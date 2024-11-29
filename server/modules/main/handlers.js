const debug = require('debug')('&:MAIN: handlers')


const getReader = async (req, res, next) => {
    try {
        const {qr_data} = req.body
        console.log(qr_data,'dataaa')
        res.send({status:'approved'});
    } catch (e) {
        debug('Error in handlers/entradaEvento ' + e);
        next(e); 
    }
};


const login = async (req, res, next) => {
    try {
        const file = 'inicio.html';
        res.sendFile(file, { root: path.resolve('client') }, function (err) {
            if (err) {
                console.log(err);
            }
        });
        // res.send({status:'denied'});
    } catch (err) {
        console.log(err, 'error');
    }
};

module.exports = {
    getReader,
    login
}