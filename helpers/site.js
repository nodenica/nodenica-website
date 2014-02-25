var models = require('../models');
var path = require('path');
var config = require('../config');

exports.title = function (req, res, next) {

    models.settings.findOne({key: 'site' }, 'value', function(err, obj){

        res.locals.title = res.lingua.content.install.title;

        if( !err && obj ){
            res.locals.title = obj.value.title;
        }

        next();
    });

}

exports.url = function(req, res, next){
    var hostname = req.headers.host;
    var port = '';
    if( hostname.match(/:/g) ){
        if( req.headers.host.split( ":")[1] != 80 || req.headers.host.split( ":")[1] != 443  ){
            hostname = req.headers.host.slice( 0, req.headers.host.indexOf(":") );
            port = ":" + req.headers.host.split( ":")[1];
        }
    }

    res.locals.siteUrl = req.protocol + '://' + hostname + port;

    next();

}

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

exports.isProduction = function(){
    if( environment() === 'production' ){
        return true;
    }
    else{
        return false;
    }
}

var template = function( sourceJadeFile ){
    return 'template/' + config.template + '/' + sourceJadeFile;
}

exports.template = template;