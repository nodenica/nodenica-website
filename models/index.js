/**
 * @description Read all files and make export for file
 *              ignoring index file.
 * @type {exports}
 */

var fs = require( 'fs' );
var path = require( 'path' );
var config = require( '../config' );
var mongoose = require('mongoose');
var helpers = require('../helpers');
var util = require('util');

var url = util.format( 'mongodb://%s:%s@%s:%s/%s', config.mongodb.username, config.mongodb.password, config.mongodb.host, config.mongodb.port, config.mongodb.db );

var db = mongoose.createConnection( url );

db.on('error', function () {
    helpers.log.error( arguments[0] );
});

db.on('open', function () {
    helpers.log.message( 'Database connected' );
});


var files = fs.readdirSync( __dirname );

files.forEach(function( file ){
    var file_name = path.basename( file, '.js' );

    if( file_name != 'index' ){
        exports[file_name] = require( './' + file_name ).setup( mongoose, db );
    }
});