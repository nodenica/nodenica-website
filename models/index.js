/**
 * @description Read all files and make export for file
 *              ignoring index file.
 * @type {exports}
 */

var helpers = require('../helpers');
var fs = require( 'fs' );
var path = require( 'path' );
var config = require( '../config' );
var mongoose = require('mongoose');
var db = mongoose.createConnection( config.mongodb.url );

var errors = 0;

db.on('error', function () {

    helpers.email.alert( 'MongoDB is Down', 'Error to connect with mongodb database' );

});


db.once('open', function () {

    var files = fs.readdirSync( __dirname );

    files.forEach(function( file ){
        var file_name = path.basename( file, '.js' );

        if( file_name != 'index' ){
            exports[file_name] = require( './' + file_name ).setup( mongoose, db );
        }
    });

});


