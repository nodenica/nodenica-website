var config = require('../config');
var path = require('path');
var fs = require('fs');
module.exports = function(){

    var json = fs.readFileSync( path.resolve( __dirname, '../i18n/' + config.lang + '.json' ),'utf8');

    return JSON.parse( json );

}