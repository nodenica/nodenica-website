var config = require('../config');
var raven = require('raven');

var client = new raven.Client( config.log.url );

// Simple message
exports.message = function( message, level ){

    level = level || 'info';

    client.captureMessage( message, {level: level} );

}

// Error message
exports.error = function( message ){

    client.captureError(new Error( message ));

}