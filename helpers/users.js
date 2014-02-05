var config = require('../config');
var crypto = require('crypto');
var util = require('util');
var i18n = require('../helpers').i18n();
var models = require('../models');
var S = require('string');


var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

/**
 *
 * Create a string password with password variable and secure password hash
 *
 * @param {String} password
 * @returns {String} passwordHash
 */

exports.passwordHash = function( password ){

    // create a md5 from string password and hash
    var passwordHash = crypto.createHash('md5').update( password + '_' + config.secure.password.hash ).digest('hex');

    return passwordHash;

}

/**
 *
 * Create a string name with firstName and lastName variable capitalizing
 *
 * @param {String} fistName
 * @param {String} lastName
 * @returns {String} name
 */
exports.nameFormat = function( fistName, lastName ){

    var allName = new Array();

    if( !S(fistName).isEmpty() ){

        var fistNames = S( fistName ).trim().s.split(' ');

        fistNames.forEach(function(word){

            if( !S(word).isEmpty() ){

                allName.push( S( S(word).capitalize().s ).trim().s );

            }

        });

    }

    if( !S(lastName).isEmpty() ){

        var lastNames = S( lastName ).trim().s.split(' ');

        lastNames.forEach(function(word){

            if( !S(word).isEmpty() ){

                allName.push( S( S(word).capitalize().s ).trim().s );

            }

        });

    }


    return allName.join(' ');
}

/**
 *
 * Check if username is valid
 *
 * @param {String} username
 * @returns {Boolean}
 */
exports.isValidUsername = function( username ){
    return /^[a-zA-Z0-9]+$/.test( username );
}


/**
 *
 * Check if ObjectId is valid
 *
 * @param {String} ObjectId
 * @returns {Boolean}
 */
exports.isValidObjectID = function(str) {
    var len = str.length, valid = false;
    if (len == 12 || len == 24) {
        valid = /^[0-9a-fA-F]+$/.test(str);
    }
    return valid;
}


/**
 *
 * Check if ObjectId is valid
 *
 * @param {Int} length
 * @returns {String}
 */
exports.random = function(length) {
    length = length ? length : 32;

    var string = '';

    for (var i = 0; i < length; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        string += chars.substring(randomNumber, randomNumber + 1);
    }

    return string;
}

exports.makeToken = function( str ){

    var length = 32;

    var string = '';

    for (var i = 0; i < length; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        string += chars.substring(randomNumber, randomNumber + 1);
    }

    return crypto.createHash('md5').update( str + '_' + string + '_' + config.secure.password.hash ).digest('hex');
}

exports.getAvatar = function( email ){
    return 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update( email ).digest('hex');
}

exports.addBadges = function( username, badges ){

}

exports.addActivity = function( type, params ){

    var content = '';
    switch (type){
        case 'new_question':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_question_reply':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_blog_post':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_blog_post_comment':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_event':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_event_assist':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_training':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;
        case 'new_training_comment':

            content = util.format( i18n.activity[type], params.name, params.username, params.title, params.slug);

            break;

    }

    models.users.findOne({ username: params.username },function( err, user ){

        if( !err && user ){
            var activity = {};
            activity.content = content;
            user.activity.push( activity );
            user.save(function(err){});
        }

    });

    if( content ){

        var activity_stream = new models.streaming;
        activity_stream.activity = content;
        activity_stream.save(function(err){});

    }

}