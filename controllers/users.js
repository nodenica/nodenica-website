var models = require( '../models' );
var helpers = require( '../helpers' );
var config = require( '../config' );
var marked = require( 'marked' );
var async = require('async');
var vsprintf = require("sprintf-js").vsprintf;
var mongoose = require('mongoose');
var util = require('util');
var moment = require('moment');
moment.lang( config.lang );


exports.get = function( req, res ){
    var username = req.params.username,
        projection = [
            'username', 'name', 'email', 'avatar', 'badges', 'activity',
            'repositories', 'modules', 'stars', 'created_at'
        ].join(' ');

    models.users.findByUsername(username, projection, userQueryCallback);

    function userQueryCallback(err, user){
        if( user ){
            if( user.activity.length > 0 ){
                var i = 0;
                user.activity.forEach(function(activity){

                    if( i <= 100 ){

                        user.activity[i].date = moment(activity.created_at).fromNow();
                        i++;

                    }

                });
            }

            res.locals.title = helpers.site.setTitle( user.name, res );

            res.render( helpers.site.template( 'profile' ), { marked:marked, profile: user } );

        }
        else{
            res.redirect('/');
        }

    };
};


/**
 *
 * SingUp
 *
 * @param req
 * @param res
 */
exports.signUp = function( req, res ){

    var error = null;
    var focus = 'username';
    var go = true;


    for (var key in req.body){

        if( req.body[key] === '' && go ){
            error = res.lingua.content.install.information.form.error.empty[key];
            focus = key;
            go = false;
        }

    }

    if( req.body.username && !helpers.users.isValidUsername( req.body.username ) ){
        error = res.lingua.content.install.information.form.error.invalid.username;
        focus = 'username';
        go = false;
    }


    switch ( req.method ){
        case 'GET':
            res.render(helpers.site.template( 'singup' ), { error: error, focus: focus, form: req.body });
            break;
        case 'POST':
            if( go ){

                async.parallel({
                        username: function(callback){
                            models.users.findByUsername(req.body.username.trim(), function(err, user) {
                                if( err ){
                                    callback(err, null);
                                }
                                else{
                                    if( user ){
                                        callback(vsprintf(res.lingua.content.sing_up.form.error.exist,[res.lingua.content.install.information.form.username,req.body.username]), null);
                                    }
                                    else{
                                        callback(null, true);
                                    }
                                }
                            });

                        },
                        email: function(callback){

                            models.users.findByEmail(req.body.email.trim(), function(err, user){
                                if( err ){
                                    callback(err, null);
                                }
                                else{
                                    if( user ){
                                        callback(vsprintf(res.lingua.content.sing_up.form.error.exist,[res.lingua.content.install.information.form.email,req.body.email]), null);
                                    }
                                    else{
                                        callback(null, true);
                                    }
                                }
                            });


                        }
                    },
                    function(err, results) {

                        if( err ){
                            error = err;
                            res.render(helpers.site.template( 'singup' ), { error: error, focus: focus, form: req.body });
                        }
                        else{
                            if( results.username && results.email ){
                                var newUser = new models.users;

                                newUser.username = req.body.username;
                                newUser.first_name = helpers.users.nameFormat( req.body.first_name, ''  );
                                newUser.last_name = helpers.users.nameFormat( '', req.body.last_name  );
                                newUser.name = helpers.users.nameFormat( req.body.first_name, req.body.last_name );
                                newUser.email = req.body.email;
                                newUser.password = helpers.users.passwordHash( req.body.password );
                                newUser.range = 5;
                                newUser.forgot_token = helpers.users.makeToken( newUser._id );
                                newUser.active_token = helpers.users.makeToken( newUser._id );
                                newUser.avatar = helpers.users.getAvatar( req.body.email );

                                newUser.save( function( err ){

                                    if( err ){
                                        error = err;
                                        res.render(helpers.site.template( 'singup' ), { error: error, focus: focus, form: req.body });
                                    }
                                    else{
                                        // Send email
                                        var email = {
                                            text: util.format( res.lingua.content.sing_up.email.subject, helpers.users.nameFormat( req.body.first_name, req.body.last_name ) ) + '\n\n' + util.format( res.lingua.content.sing_up.email.body, res.locals.siteUrl + '/user/activate/' + newUser.active_token ),
                                            to: helpers.users.nameFormat( req.body.first_name, req.body.last_name ) + '<' + req.body.email + '>',
                                            subject: util.format( res.lingua.content.sing_up.email.subject, helpers.users.nameFormat( req.body.first_name, req.body.last_name ) )
                                        }
                                        helpers.email.send( email );

                                        // Redirect to activate page
                                        res.redirect('/user/activate');
                                    }

                                });
                            }
                        }

                    });

            }
            else{
                res.render(helpers.site.template( 'singup' ), { error: error, focus: focus, form: req.body });
            }

            break;
    }
}


/**
 *
 * Active Home Page
 *
 * @param req
 * @param res
 */
exports.activateIndex = function( req, res ){
    if( req.session.user ){
        res.redirect('/');
    }

    res.render( helpers.site.template( 'activate' ), { mode: 'default' });
}


/**
 *
 * Active proccess ID
 *
 * @param req
 * @param res
 */
exports.activateAction = function( req, res ){

    if( req.session.user ){
        res.redirect('/');
    }
    else{
        if( req.params.id  ){

            models.users.findOne({ active_token: req.params.id }, function(err, user){
                if( err ){
                    res.render(helpers.site.template( 'activate' ), { mode: 'action', error: err });
                }
                else{
                    if( user ){
                        models.users.findByIdAndUpdate(user.id, { active: true }, function(err, thank){
                            if( err ){
                                res.render(helpers.site.template( 'activate' ), { mode: 'action', error: err });
                            }
                            else{
                                // Add activity
                                var activity = {
                                  name: user.name,
                                  username: user.username
                                }
                                helpers.users.addActivity('new_user', activity, req.socketio);

                                res.redirect('/user/login?a=1');
                            }

                        });
                    }
                    else{
                        res.redirect('/')
                    }
                }

            });
        }
        else{
            res.redirect('/');
        }
    }



}


/**
 *
 * Login
 *
 * @param req
 * @param res
 */
exports.login = function( req, res ){

    if( req.session.user ){
        res.redirect('/');
    }

    var back = '/';

    switch ( req.method ){
        case 'GET':
            res.render(helpers.site.template( 'login' ), { form: req.body });
            break;
        case 'POST':
            var projection = 'username password name email range badges active avatar';
            if( req.query.back ){
                back = req.query.back;
            }

            models.users.findByCredentials(req.body.username, req.body.password, projection, function(err,user){
                if( !err ){
                    if( user ){

                        if( !user.active ){
                            res.render(helpers.site.template( 'login' ), { form: req.body, error: vsprintf(res.lingua.content.login.error.user_active,[req.body.username]) });
                        }
                        else{
                            req.session.user = user;
                            res.redirect(back);
                        }

                    }
                    else{
                        res.render(helpers.site.template( 'login' ), { form: req.body, error: res.lingua.content.login.error.incorrect_data });
                    }
                }
            });


            break;
    }

}


/**
 *
 * Logout
 *
 * @param req
 * @param res
 */
exports.logout = function( req, res ){

    req.session.destroy(function(err){
        if( !err ){
            res.redirect('/user/login');
        }
    });

}


/**
 *
 * Forgot
 *
 * @param req
 * @param res
 */
exports.forgot = function( req, res ){

    if( req.session.user ){
        res.redirect('/');
    }

    switch ( req.method ){
        case 'GET':
            res.render(helpers.site.template( 'forgot' ), { form: req.body });
            break;
        case 'POST':

            if( req.body.email === '' ){
                res.render(helpers.site.template( 'forgot' ), { form: req.body, error: res.lingua.content.login.forgot.error.empty });
            }
            else{

                models.users.findOne({ email: req.body.email  }, 'username name email forgot_token' , function(err,user){
                    if( !err ){
                        if( user ){

                            // Send email
                            var email = {
                                text: util.format( res.lingua.content.login.forgot.body, res.locals.siteUrl + '/user/reset/' + user.forgot_token ),
                                to: user.name +' <' + user.email + '>',
                                subject: res.lingua.content.login.forgot.subject
                            }
                            helpers.email.send( email );

                            // Load view
                            res.render(helpers.site.template( 'forgot' ), { sent: res.lingua.content.login.forgot.sent });
                        }
                        else{
                            res.render(helpers.site.template( 'forgot' ), { form: req.body, error: vsprintf(res.lingua.content.login.forgot.error.email,[req.body.email]) });
                        }
                    }
                });

            }

            break;
    }

}


/**
 *
 * Reset password
 *
 * @param req
 * @param res
 */
exports.reset = function( req, res ){

    models.users.findOne({ forgot_token: req.params.forgot_token  } , function(err,user){
        if( err ){
            res.render(helpers.site.template( 'reset' ), { form: req.body, error: err });
        }
        else{
            if( user ){
                switch ( req.method ){
                    case 'GET':
                        res.render(helpers.site.template( 'reset' ), { form: req.body });
                        break;
                    case 'POST':

                        if( req.body.password === '' ){
                            res.render(helpers.site.template( 'reset' ), { form: req.body, error: res.lingua.content.login.reset.error.empty });
                        }
                        else{
                            user.password = helpers.users.passwordHash( req.body.password );
                            user.forgot_token = helpers.users.makeToken( user._id + new Date().toLocaleDateString );
                            user.save(function(err){
                                if( err ){
                                    res.render(helpers.site.template( 'reset' ), { form: req.body, error: err });
                                }
                                else{

                                    // Send email
                                    var email = {
                                        text: util.format( res.lingua.content.login.reset.body, res.locals.siteUrl + '/user/login' ),
                                        to: user.name +' <' + user.email + '>',
                                        subject: res.lingua.content.login.reset.subject
                                    }
                                    helpers.email.send( email );

                                    // Load view
                                    res.render(helpers.site.template( 'reset' ), { form: req.body, reset: res.lingua.content.login.reset.success });
                                }
                            })


                        }

                        break;
                }
            }
            else{
                res.redirect('/');
            }
        }

    });





}
