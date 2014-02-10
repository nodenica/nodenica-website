var S = require( 'string' );
var models = require( '../models' );
var marked = require( 'marked' );
var async = require( 'async' );
var helpers = require( '../helpers' );
var moment = require('moment');
var config = require('../config');
var slugs = require('slug');
var util = require('util');
moment.lang(config.lang);

exports.home = function( req, res ){

    var newPostUrl = ( req.session.user ) ? '/blog/create' : '/user/login?back=/blog/create';

    var publisher = ( req.session.user && (req.session.user.range === 1 || req.session.user.range === 2) ) ? true: false;

    var q = models.blog.find({}).sort({'created_at': -1}).limit(10);

    q.exec(function(err, posts) {
        if( err ){
            res.send( err );
        }
        else{
            if( posts ){
                var i = 0;
                posts.forEach(function(post){
                    posts[i].date =  moment(post.created_at).fromNow();
                    i++;
                });

                res.render('template/blog/index.jade', { publisher: publisher, newPostUrl: newPostUrl, posts: posts, marked:marked });
            }
            else{
                res.send('0 questions');
            }
        }

    });

}

exports.get = function( req, res ){

    if( req.method === 'POST' ){
        models.blog.findOne({slug: req.params.slug }, function (err, post) {
            if (!err && post && !S(req.body.content).isEmpty() ){

                var comment = {};
                var author = {};
                author.username = req.session.user.username;
                author.email = req.session.user.email;
                author.avatar = req.session.user.avatar;
                comment.author = author;
                comment.content = S(req.body.content).stripTags().s;

                post.comments.push( comment );
                post.save(function(err){
                    if( !err ){
                        var params = {};
                        params.name = req.session.user.name;
                        params.username = req.session.user.username;
                        params.slug = req.params.slug;
                        params.title = post.title;
                        helpers.users.addActivity('new_blog_post_comment', params, req.socketio);

                        // email notify author
                        helpers.email.notify([ post.author.username + '<' + post.author.email + '>' ], util.format(res.lingua.content.notify.comment.subject, post.title), util.format(res.lingua.content.notify.comment.body, post.title), res.locals.siteUrl + '/blog/' + post.slug );

                        res.redirect( req.path );
                    }
                });

            }
            else{
                res.redirect( req.path );
            }
        });

    }
    else{

        async.parallel({
                post: function(callback){

                    models.blog.findOne({ slug: req.params.slug },function(err,post){

                        if( !err && post ){

                            post.date = moment(post.created_at).format('MMMM Do YYYY, h:mm:ss a');

                            if( post.comments.length > 0 ){
                                var i = 0;
                                post.comments.forEach(function(comment){
                                    post.comments[i].date = moment(comment.created_at).fromNow();
                                    i++;
                                });
                            }

                            callback(null, post);

                        }

                        else{

                            callback(null, null);

                        }

                    });

                },
                posts: function(callback){

                    var p = models.blog.find({}).sort({'created_at': -1}).limit(50);

                    p.exec(function(err, posts) {

                        if( !err && posts ){

                            callback(null, posts);

                        }
                        else{

                            callback(null, null);

                        }


                    });

                }
            },
            function(err, results) {

                if( results.post && results.posts ){

                    var permissions = false;

                    var user = user || req.session.user;

                    if( user && req.session.user.username === results.post.author.username ){
                        permissions = true;
                    }

                    res.render('template/blog/blog.jade',{ marked:marked, post: results.post, posts: results.posts, user: user, permissions: permissions });

                }
                else{
                    res.send('404');
                }

            });

    }


}

exports.create = function( req, res ){

    var publisher = ( req.session.user && (req.session.user.range === 1 || req.session.user.range === 2) ) ? true: false;

    if( !publisher ){
        res.redirect('/');
    }
    else{

        switch ( req.method ){
            case 'GET':
                res.render('template/blog/create.jade',{ form: req.body });
                break;
            case 'POST':

                var error = null;
                var title = req.body.title;
                var content = req.body.content;

                if( S(title).isEmpty() ){
                    error = res.lingua.content.questions.create.form.empty.title;
                }

                if( S(content).isEmpty() ){
                    error = res.lingua.content.questions.create.form.empty.content;
                }


                title = S(title).stripTags().s;
                content = S(content).stripTags().s;

                var slug = S(slugs(title)).slugify().s;

                var author = {};
                author.username = req.session.user.username;
                author.email = req.session.user.email;
                author.avatar = req.session.user.avatar;

                //
                models.blog.findOne({ slug: slug },function(err,post){
                    if( err ){
                        error = err;
                    }
                    else{
                        if( post ){

                            error = res.lingua.content.questions.create.form.exist;
                            res.render('template/blog/create.jade', { error: error, form: req.body });

                        }
                        else{

                            if( error ){

                                res.render('template/blog/create.jade', { error: error, form: req.body });

                            }
                            else{

                                var new_post = new models.blog;

                                new_post.slug = slug;
                                new_post.title = title;
                                new_post.content = content;
                                new_post.author = author;

                                new_post.save(function( err ){
                                    if( err ){
                                        res.render('template/blog/create.jade', { error: error, form: req.body });
                                    }
                                    else{
                                        var params = {};
                                        params.name = req.session.user.name;
                                        params.username = req.session.user.username;
                                        params.slug = slug;
                                        params.title = title;
                                        helpers.users.addActivity('new_blog_post', params, req.socketio);
                                        res.redirect('/blog/'+slug);
                                    }

                                });

                            }


                        }



                    }

                });

                break;
        }
    }


}


exports.edit = function( req, res ){

    var publisher = ( req.session.user && (req.session.user.range === 1 || req.session.user.range === 2) ) ? true: false;

    if( !publisher ){
        res.redirect('/');
    }
    else{

        switch ( req.method ){
            case 'GET':

                models.blog.findOne({ slug: req.params.slug },function(err,post){
                    if( !err && post ){
                        req.body.title = post.title;
                        req.body.content = post.content;
                        res.render('template/blog/create.jade',{ form: req.body, mode: "edit" });
                    }
                    else{
                        res.redirect('/');
                    }

                });

                break;
            case 'POST':

                var error = null;
                var title = req.body.title;
                var content = req.body.content;

                if( S(title).isEmpty() ){
                    error = res.lingua.content.questions.create.form.empty.title;
                }

                if( S(content).isEmpty() ){
                    error = res.lingua.content.questions.create.form.empty.content;
                }


                title = S(title).stripTags().s;
                content = S(content).stripTags().s;

                models.blog.findOne({ slug: req.params.slug },function(err,post){
                    if( err ){
                        res.redirect('');
                    }
                    else{
                        if( post ){

                            post.title = title;
                            post.content = content;

                            post.save(function( err ){
                                if( err ){
                                    res.render('template/blog/create.jade', { error: error, form: req.body });
                                }
                                else{
                                    res.redirect('/blog/'+req.params.slug);
                                }

                            });

                        }

                    }

                });

                break;
        }
    }


}