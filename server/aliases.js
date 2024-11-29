const moduleAlias = require('module-alias')
const path = require('path')
moduleAlias.addAliases({
    '@qrReader': path.join(__dirname, 'modules','qrReader'),
    '@db': path.join(__dirname, 'database'),
    
})