const { knex } = require('../database/knex.js');

const Transport = require('winston-transport');
//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class PostgresTransport extends Transport {
    constructor (opts) {
        super(opts);
        this.table = opts.table;
    }

    async log (info, callback) {
        try {
            await knex(this.table).insert(info);
            callback();
        } catch (e) {
            console.log('e', e);
        }
    };
};
