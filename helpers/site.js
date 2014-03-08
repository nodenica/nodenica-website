var models = require('../models');
var path = require('path');
var config = require('../config');

/**
 * Obtain site settings
 *
 * @param callback
 */
var get = function(callback){
    models.settings.findOne({key: 'site' }, 'value', function(err, data){
        if( err ){
            console.log( err );
            callback( null );
        }
        else{
            callback( data.value );
        }
    });
}

module.exports.get = get;

/**
 * Create middleware to title
 *
 * @param req
 * @param res
 * @param next
 */
exports.express = function (req, res, next) {

    // URL
    var hostname = req.headers.host;
    var port = '';
    if( hostname.match(/:/g) ){
        if( req.headers.host.split( ":")[1] != 80 || req.headers.host.split( ":")[1] != 443  ){
            hostname = req.headers.host.slice( 0, req.headers.host.indexOf(":") );
            port = ":" + req.headers.host.split( ":")[1];
        }
    }
    res.locals.siteUrl = req.protocol + '://' + hostname + port;


    // Title
    get(function( site ){

        res.locals.title = res.lingua.content.install.title;

        if( site ){
            res.locals.title = site.title;
        }

        next();

    });

}

/**
 * Set environment
 *
 * @returns {string}
 */
var environment = function(){
    switch ( path.resolve(__dirname, '../' ) ){
        case '/sites/Node-Community':
            return 'production'
            break;
        default:
            return 'development'
    }
}

exports.environment = environment();


/**
 * Check if environment is production
 *
 * @returns {boolean}
 */
exports.isProduction = function(){
    if( environment() === 'production' ){
        return true;
    }
    else{
        return false;
    }
}

/**
 * Return site template folder
 *
 * @param sourceJadeFile
 * @returns {string}
 */
var template = function( sourceJadeFile ){
    return 'template/' + config.template + '/' + sourceJadeFile;
}

exports.setTitle = function( title, res ){
    return title + ' - ' + res.locals.title;
}

exports.template = template;