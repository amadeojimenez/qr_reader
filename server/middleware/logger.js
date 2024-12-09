const winston = require('winston')
const debug = require('debug')('&:WINSTON_PRIVATELOGS')
const PostgresTransport = require('./_PostgresTransport.js')

const _privateLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new PostgresTransport({
            table: 'requests_logs'
        })
    ]
})

const _errorLogger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new PostgresTransport({
            table: 'error_logs'
        })
    ]
})

const privateLogger = (req, res, next) => {
    try {
        const objectO = {
            level: 'info',
            statuscode: `${res.statusCode}`,
            method: req.method,
            endpoint: req.originalUrl,
            payload: JSON.stringify(req.body) 
        }
        // debug(objectO);
        debug('privateLogger', req.originalUrl)
        _privateLogger.log(objectO)
    } catch (error) {
        debug('privateLogger', error)
    } finally {
        next()
    }
    
}

const errorsLogger = (err, req, res, next) => {
    try {
        console.log('Error in errorsLogger ' + err)
        debug('errorsLogger', req.originalUrl)
        const objectO = {
            level: 'error',
            statuscode: `${res.statusCode}`,
            method: req.method,
            endpoint: req.originalUrl,
            payload: JSON.stringify(req.body || {}),//TODO 
            error: err.message
        }
        // debug(objectO);
        debug('errorsLogger', objectO)
        _errorLogger.log(objectO)
    } catch (e) {
        debug('Error in errorsLogger ' + e)
    } finally {
        next()
    }
}

module.exports = { privateLogger, errorsLogger }
