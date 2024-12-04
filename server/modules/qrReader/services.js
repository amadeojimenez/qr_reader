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

const checkIfMustSign = async (idUser) => {
    const users = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    return users.includes(idUser);
}


// const entradaEvento = async (idUser, uniqueHash='none') => {
//     try {
//         if (!checkIfValidQR(idUser)) {
//             return 'invalid_id';
//         }
//         const lastUserRecord = await knex('t_users').where('user_id', idUser).orderBy('fecha', 'desc').first();

//         if (!lastUserRecord) {
//             await knex('t_users').insert({uniqueHash, user_id: idUser, action: 'in' });
//             const checkIfSign = await checkIfMustSign(idUser);
//             if (checkIfSign) {
//                 return 'must_sign';
//             } else {
//                 return 'ok';
//             }
//         } else if (lastUserRecord.action === 'out') {
//             await knex('t_users').insert({ uniqueHash, user_id: idUser, action: 'in' });
//             return 'was_out';
//         } else {
//             return 'already_in';
//         }
//     } catch (e) {
//         debug('Error in services/entradaEvento ' + e);
//         throw e;
//     }
// }



// const salidaEvento = async (idUser, uniqueHash = 'none') => {
//     try {
//         if (!checkIfValidQR(idUser)) {
//             return 'invalid_id';
//         }
//         const lastUserRecord = await knex('t_users').where('user_id', idUser).orderBy('fecha', 'desc').first();
//         if (!lastUserRecord) {
//             return 'not_in';
//         } else if (lastUserRecord.action === 'in') {
//             await knex('t_users').insert({ uniqueHash, user_id: idUser, action: 'out' });
//             return 'was_in';
//         } else {
//             return 'already_out';
//         }
//     } catch (e) {
//         debug('Error in services/salidaEvento ' + e);
//         throw e;
//     }
// }

const entradaEvento = async (idUser, uniqueHash='none') => {
    try {
       
            await knex('t_users').insert({uniqueHash, user_id: idUser, action: 'in' });
            return 'done';
       
    } catch (e) {
        debug('Error in services/entradaEvento ' + e);
        throw e;
    }
}

const salidaEvento = async (idUser, uniqueHash = 'none') => {
    try {
       
            await knex('t_users').insert({ uniqueHash, user_id: idUser, action: 'out' });
            return 'done';
    } catch (e) {
        debug('Error in services/salidaEvento ' + e);
        throw e;
    }
}


// const insertLocalStorageIntoDB = async (LocalStorageData) => {
//     try {
     
//          const QrDataToInsert = LocalStorageData.map(record => ({
//             user_id: record.id,
//             action: record.inOrOut,
//             fecha: record.timestamp,
//         }));

//         await knex('t_users').insert(QrDataToInsert);

//         return 'Offline data processed successfully.';
//     } catch (e) {
//         debug('Error in services/insertLocalStorageIntoDB ' + e);
//         throw e;
//     }
// };

const insertLocalStorageIntoDB = async (LocalStorageData) => {
    try {

        const incomingHashes = LocalStorageData.map(record => record.uniqueHash);

        // Fetch existing hashes from the database
        const existingHashes = await knex('t_users')
            .whereIn('uniqueHash', incomingHashes)
            .pluck('uniqueHash'); // Fetch only the hash column

        // Filter out records that already exist in the database
        const newQrData = LocalStorageData.filter(record => !existingHashes.includes(record.uniqueHash));

        if (newQrData.length === 0) {
            return 'No new data to insert.';
        }

        const QrDataToInsert = newQrData.map(record => ({
            user_id: record.id,
            action: record.inOrOut,
            fecha: record.timestamp,
            uniqueHash: record.uniqueHash, 
        }));

        // Insert the new data into the database
        await knex('t_users').insert(QrDataToInsert);

        return `${newQrData.length} new records inserted successfully.`;
    } catch (e) {
        debug('Error in services/insertLocalStorageIntoDB ' + e);
        throw e;
    }
};


// const getUpdatedDatabase = async () => {
//     try {
//         const result = await knex('t_users').select('user_id', 'action', 'fecha');

//         const formattedData = result.map(record => ({
//             id: record.user_id,
//             inOrOut: record.action,
//             timestamp: record.fecha,
//         }));

//         return formattedData;
//     } catch (e) {
//         debug('Error in services/getUpdatedDatabase ' + e);
//         throw e;
//     }
// };


const getUpdatedDatabase = async () => {
    try {
        // get only the records with max fecha for each user_id
        const result = await knex('t_users')
        .select('user_id', 'action', 'fecha', 'uniqueHash')
        .whereIn(
            'fecha',
            knex('t_users')
                .select(knex.raw('MAX(fecha)'))
                .groupBy('user_id')
        );
        const formattedData = result.map(record => ({
            id: record.user_id,
            inOrOut: record.action,
            timestamp: record.fecha,
            uniqueHash: record.uniqueHash
        }));
        // console.log('formattedData', formattedData)

        return formattedData;
    } catch (e) {
        debug('Error in services/getUpdatedDatabase ' + e);
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
    insertLocalStorageIntoDB,
    getUpdatedDatabase
}