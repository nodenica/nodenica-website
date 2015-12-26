var config = require('../config');
var raven = require('raven');

var client = config.log.url ? new raven.Client( config.log.url ) : false;

// Simple message
exports.message = function( message, level ){

    level = level || 'info';

    if (client) {
        client.captureMessage( message, {level: level} );
    }
    else {
        console.info(message);
    }
}

// Error message
exports.error = function( message ){

    if (client) {
        client.captureError(new Error( message ));
    }
    else {
        console.error(message);
    }


}
