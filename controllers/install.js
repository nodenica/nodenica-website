var models = require( '../models' );
var helpers = require( '../helpers' );
var async = require('async');

exports.home = function( req, res ){

    models.users.count({}, function(err, c){
        if( err ){
            res.render('install/index.jade', {error: err});
        }
        else{
            if( c > 0 ){
                res.redirect('/');
            }
            else{
                var error = null;
                var focus = 'site';
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
                        res.render('install/index.jade', { error: error, focus: focus, form: req.body });
                        break;
                    case 'POST':
                        if( go ){
                            async.parallel({
                                    users: function(callback){
                                        var admin = new models.users;

                                        admin.username = req.body.username;
                                        admin.first_name = helpers.users.nameFormat( req.body.first_name, ''  );
                                        admin.last_name = helpers.users.nameFormat( '', req.body.last_name  );
                                        admin.name = helpers.users.nameFormat( req.body.first_name, req.body.last_name  );
                                        admin.email = req.body.email;
                                        admin.password = helpers.users.passwordHash( req.body.password );
                                        admin.range = 1;
                                        admin.active = true;
                                        admin.forgot_token = helpers.users.makeToken( admin._id );
                                        admin.active_token = helpers.users.makeToken( admin._id );
                                        admin.avatar = helpers.users.getAvatar( req.body.email );

                                        admin.save( function( err ){

                                            if( err ){
                                                callback(err, null);
                                            }
                                            else{
                                                callback(null, true);
                                            }

                                        });
                                    },
                                    settings: function(callback){

                                        var domain = req.headers.host;
                                        if( domain.match(/:/g) ){
                                            domain = req.headers.host.slice( 0, req.headers.host.indexOf(":") );
                                        }

                                        var site = new models.settings;
                                        site.key = 'site';
                                        site.value = { title: req.body.site, domain: domain };

                                        site.save( function( err ){

                                            if( err ){
                                                callback(err, null);
                                            }
                                            else{
                                                callback(null, true);
                                            }

                                        });


                                    }

                                },
                                function(err, results) {
                                    if( err ){
                                        error = err;
                                        res.render('install/index.jade', { error: error, focus: focus, form: req.body });
                                    }
                                    else{
                                        res.redirect('/');
                                    }


                                });

                        }

                        else{
                            res.render('install/index.jade', { error: error, focus: focus, form: req.body });
                        }

                        break;
                }
            }
        }
    });









}