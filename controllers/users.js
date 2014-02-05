var models = require( '../models' );
var helpers = require( '../helpers' );
var config = require( '../config' );
var marked = require( 'marked' );
var async = require('async');
var vsprintf = require("sprintf-js").vsprintf;
var mongoose = require('mongoose');
var moment = require('moment');
moment.lang( config.lang );


exports.get = function( req, res ){

    models.users.findOne({username: req.params.username }, 'username name email avatar badges activity repositories modules stars created_at', function(err, user){

        //if( user.activity.length > 0 ){
        //    user.activity.push( vsprintf( res.lingua.content.profile.created_at,[moment(user.created_at).fromNow()]) );
        //}

        if( user.activity.length > 0 ){
            var i = 0;
            user.activity.forEach(function(activity){

                if( i <= 100 ){

                    user.activity[i].date = moment(activity.created_at).fromNow();
                    i++;

                }

            });
        }

        res.render( 'template/profile.jade', { marked:marked, profile: user } );
    });

}


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
            res.render('template/singup.jade', { error: error, focus: focus, form: req.body });
            break;
        case 'POST':
            if( go ){

                async.parallel({
                        username: function(callback){
                            models.users.findOne({username: req.body.username }, function(err, user){
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

                            models.users.findOne({email: req.body.email }, function(err, user){
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
                            res.render('template/singup.jade', { error: error, focus: focus, form: req.body });
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
                                        res.render('template/singup.jade', { error: error, focus: focus, form: req.body });
                                    }
                                    else{
                                        helpers.email.singUp([ helpers.users.nameFormat( req.body.first_name, req.body.last_name ) + '<' + req.body.email + '>' ], vsprintf(res.lingua.content.sing_up.email.subject,[helpers.users.nameFormat( req.body.first_name, req.body.last_name )]), res.lingua.content.sing_up.email.body, res.locals.siteUrl + '/user/activate/' + newUser.active_token );
                                        res.redirect('/user/activate');
                                    }

                                });
                            }
                        }

                    });

            }
            else{
                res.render('template/singup.jade', { error: error, focus: focus, form: req.body });
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

    res.render('template/activate.jade', { mode: 'default' });
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
        if( helpers.users.isValidObjectID( req.params.id ) ){
            var id = mongoose.Types.ObjectId(req.params.id);

            models.users.findById(id, function(err, user){
                if( err ){
                    res.render('template/activate.jade', { mode: 'action', error: err });
                }
                else{
                    if( user ){
                        models.users.findByIdAndUpdate(req.params.id, { active: true }, function(err, tank){
                            if( err ){
                                res.render('template/activate.jade', { mode: 'action', error: err });
                            }
                            else{
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
            res.render('template/login.jade', { form: req.body });
            break;
        case 'POST':

            if( req.param('back') ){
                back = req.param('back');
            }

            models.users.findOne({ username: req.body.username, password: helpers.users.passwordHash( req.body.password ) }, 'username name email range badges active avatar' , function(err,user){
                if( !err ){
                    if( user ){

                        if( !user.active ){
                            res.render('template/login.jade', { form: req.body, error: vsprintf(res.lingua.content.login.error.user_active,[req.body.username]) });
                        }
                        else{
                            req.session.user = user;
                            res.redirect(back);
                        }

                    }
                    else{
                        res.render('template/login.jade', { form: req.body, error: res.lingua.content.login.error.incorrect_data });
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
            res.render('template/forgot.jade', { form: req.body });
            break;
        case 'POST':

            if( req.body.email === '' ){
                res.render('template/forgot.jade', { form: req.body, error: res.lingua.content.login.forgot.error.empty });
            }
            else{

                models.users.findOne({ email: req.body.email  }, 'username name email forgot_token' , function(err,user){
                    if( !err ){
                        if( user ){

                            var settings = {};
                            settings.subject = res.lingua.content.login.forgot.subject;
                            settings.greeting = vsprintf( res.lingua.content.login.forgot.greeting, [user.name] );
                            settings.body = res.lingua.content.login.forgot.body;
                            settings.href = res.locals.siteUrl + '/user/reset/' + user.forgot_token;
                            settings.to = [user.name +' <' + user.email + '>'];

                            helpers.email.link( settings );

                            res.render('template/forgot.jade', { sent: res.lingua.content.login.forgot.sent });
                        }
                        else{
                            res.render('template/forgot.jade', { form: req.body, error: vsprintf(res.lingua.content.login.forgot.error.email,[req.body.email]) });
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
            res.render('template/reset.jade', { form: req.body, error: err });
        }
        else{
            if( user ){
                switch ( req.method ){
                    case 'GET':
                        res.render('template/reset.jade', { form: req.body });
                        break;
                    case 'POST':

                        if( req.body.password === '' ){
                            res.render('template/reset.jade', { form: req.body, error: res.lingua.content.login.reset.error.empty });
                        }
                        else{
                            user.password = helpers.users.passwordHash( req.body.password );
                            user.forgot_token = helpers.users.makeToken( user._id + new Date().toLocaleDateString );
                            user.save(function(err){
                                if( err ){
                                    res.render('template/reset.jade', { form: req.body, error: err });
                                }
                                else{

                                    var settings = {};
                                    settings.subject = res.lingua.content.login.reset.subject;
                                    settings.greeting = vsprintf( res.lingua.content.login.reset.greeting, [user.name] );
                                    settings.body = res.lingua.content.login.reset.body;
                                    settings.href = res.locals.siteUrl + '/user/login';
                                    settings.to = [user.name +' <' + user.email + '>'];

                                    helpers.email.link( settings );

                                    res.render('template/reset.jade', { form: req.body, reset: res.lingua.content.login.reset.success });
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