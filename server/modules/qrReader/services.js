const debug = require('debug')('&:QR READER: handlers')
const { knex } = require('../../database/knex.js');

const checkIfValidQR = async (idUser, uniqueHash='none') => {
    try {
        
        const validIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        return validIds.includes(idUser);

    } catch (e) {
        debug('Error in services/checkIfValidQR ' + e);
        throw e;
    }
}


const entradaEvento = async (idUser, uniqueHash='none') => {
    try {
        if (!checkIfValidQR(idUser)) {
            return 'invalid_id';
        }
        const lastUserRecord = await knex('t_users').where('user_id', idUser).orderBy('fecha', 'desc').first();

        if (!lastUserRecord) {
            await knex('t_users').insert({uniqueHash, user_id: idUser, action: 'in' });
            return 'ok';
        } else if (lastUserRecord.action === 'out') {
            await knex('t_users').insert({ uniqueHash, user_id: idUser, action: 'in' });
            return 'was_out';
        } else {
            return 'already_in';
        }
    } catch (e) {
        debug('Error in services/entradaEvento ' + e);
        throw e;
    }
}

const salidaEvento = async (idUser, uniqueHash = 'none') => {
    try {
        if (!checkIfValidQR(idUser)) {
            return 'invalid_id';
        }
        const lastUserRecord = await knex('t_users').where('user_id', idUser).orderBy('fecha', 'desc').first();
        if (!lastUserRecord) {
            return 'not_in';
        } else if (lastUserRecord.action === 'in') {
            await knex('t_users').insert({ uniqueHash, user_id: idUser, action: 'out' });
            return 'was_in';
        } else {
            return 'already_out';
        }
    } catch (e) {
        debug('Error in services/salidaEvento ' + e);
        throw e;
    }
}

const offlineData = async (offlineQrData) => {
    try {
     
         const QrDataToInsert = offlineQrData.map(record => ({
            user_id: record.id,
            action: record.inOrOut,
            fecha: record.timestamp,
        }));

        await knex('t_users').insert(QrDataToInsert);

        return 'Offline data processed successfully.';
    } catch (e) {
        debug('Error in services/offlineData ' + e);
        throw e;
    }
};

// entradaEvento(300)
// salidaEvento(300)
// entradaEvento(1200)
// entradaEvento(1200)

module.exports = {
    entradaEvento,
    salidaEvento,
    offlineData
}