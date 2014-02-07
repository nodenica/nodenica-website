var models = require( '../models' );
var marked = require( 'marked' );
var moment = require('moment');
var config = require('../config');
moment.lang(config.lang);

exports.get = function( req, res ){

    var q = models.streaming.find({}).sort({'created_at': -1}).limit(15);

    q.exec(function(err, activity) {

        res.set('Content-Type', 'application/json');

        if( activity ){
            var output = [];
            activity.forEach(function(item){

                output.push( marked( item.activity + ' ' + moment( item.created_at ).fromNow() )  );

            })
            res.send( JSON.stringify( output ) );
        }
        else{
            res.send( '[]' );
        }

    });
}