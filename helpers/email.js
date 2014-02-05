var Mailgun = require('mailgun').Mailgun;
var fs = require('fs');
var path = require('path');
var config = require( '../config' );
var models = require('../models');
var S = require('string');

var mailgun = new Mailgun( config.mailgun.api.key );

/**
 *
 * @param subject
 * @param body
 */

exports.alert = function( subject, body ){

    mailgun.sendRaw(config.email.alert.sender, config.email.alert.receivers,
        'From: ' + config.email.alert.sender +
            '\nTo: ' + config.email.alert.receivers.join(', ') +
            '\nContent-Type: text/html; charset=utf-8' +
            '\nSubject:' + subject +
            '\n\n' + loadTemplate( 'alert', { header: subject, content: body } ),
            callback);

}


/**
 *
 * @param subject
 * @param body
 */

exports.singUp = function( to, subject, body, link ){

    models.settings.findOne({key: 'site' }, 'value', function(err, obj){

        var from = obj.value.title + ' <info@' + obj.value.domain + '>';

        mailgun.sendRaw(from, to,
            'From: ' + from +
                '\nTo: ' + to.join(', ') +
                '\nContent-Type: text/html; charset=utf-8' +
                '\nSubject:' + subject +
                '\n\n' + loadTemplate( 'singup', { header: subject, content: body, link: link } ),
            callback);

    });

}



/**
 *
 * Callback function to mailgun
 *
 * @param err
 */
function callback(err) {
    if (err){
        console.log('Oh noes: ' + err);
    }
    else{
        console.log('Success');
    }
}


/**
 *
 * Load HTML file and replace data with settings params
 *
 * @param fileName
 * @param settings
 * @returns {*|string|String}
 */
function loadTemplate( fileName, settings ){
    var html = fs.readFileSync( path.resolve(__dirname, '../public/template/email_' + fileName + '.html')).toString();

    html = html.replace('{{@header}}',settings.header);
    html = html.replace('{{@content}}',settings.content);

    if( settings.link != undefined ){
        html = html.replace(/{{@link}}/g,settings.link);
    }

    html = html.replace('{{@footer}}', new Date().toDateString() );

    return html;

}

exports.link = function( settings ){

    models.settings.findOne({key: 'site' }, 'value', function(err, obj){

        var template = new Template('link').load();

        template.set( '::subject::', settings.subject );
        template.set( '::greeting::', settings.greeting );
        template.set( '::body::', settings.body );
        template.set( '::href::', settings.href );
        template.set( '::year::', new Date().getFullYear() );
        template.set( '::site_title::', obj.value.title );

        var from = obj.value.title + ' <info@' + obj.value.domain + '>';

        mailgun.sendRaw(from, settings.to,
            'From: ' + from +
                '\nTo: ' + settings.to.join(', ') +
                '\nContent-Type: text/html; charset=utf-8' +
                '\nSubject:' + settings.subject +
                '\n\n' + template.get(),
            callback);

    });

}


function Template( fileName ){

    this.load = function(){
        this.html = fs.readFileSync( path.resolve(__dirname, '../public/template/email_' + fileName + '.html')).toString();
        return this;
    }

    this.set = function( key, value ){
        this.html = S(this.html).replaceAll(key, value).s;
    }

    this.get = function(){
        return this.html;
    }


}