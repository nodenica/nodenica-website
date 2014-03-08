var email = require("emailjs");
var config = require( '../config' );
var site = require('./site');

/**
 * Send a email (plain/text)
 *
 * @param settings
 * text,to,subject
 */
var send = function( settings ){

    site.get(function(site){

        var server  = email.server.connect( config.smtp );

        var from = site.title + ' <info@' + site.domain + '>';

        var message = {
            text:    settings.text + '\n\n' + site.title,
            from:    from,
            to:      settings.to,
            subject: settings.subject
        };

        server.send(message, function(err, message) {
            //console.log(err || message);
        });

    });

}

exports.send = send;