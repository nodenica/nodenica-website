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

    var newQuestionUrl = ( req.session.user ) ? '/questions/create' : '/user/login?back=/questions/create';

    var q = models.questions.find({}).sort({'created_at': -1}).limit(50);

    q.exec(function(err, questions) {
        if( err ){
            res.send( err );
        }
        else{
            if( questions ){
                var questions_parse = [];
                questions.forEach(function(question){
                    question.date = moment(question.created_at).fromNow();
                    questions_parse.push(question);
                });

                res.render('template/question/index.jade', { newQuestionUrl: newQuestionUrl, questions: questions_parse });
            }
            else{
                res.send('0 questions');
            }
        }

    });

}

exports.get = function( req, res ){

    if( req.method === 'POST' ){
        models.questions.findOne({slug: req.params.slug }, function (err, question) {
            if (!err && question && !S(req.body.content).isEmpty() ){

                var response = {};
                var author = {};
                author.username = req.session.user.username;
                author.email = req.session.user.email;
                author.avatar = req.session.user.avatar;
                response.author = author;
                response.content = S(req.body.content).stripTags().s;

                question.responses.push( response );
                question.save(function(err){
                    if( !err ){
                        var params = {};
                        params.name = req.session.user.name;
                        params.username = req.session.user.username;
                        params.slug = req.params.slug;
                        params.title = question.title;
                        helpers.users.addActivity('new_question_reply', params, req.socketio);

                        // email notify author
                        helpers.email.notify([ question.author.username + '<' + question.author.email + '>' ], util.format(res.lingua.content.notify.response.subject, question.title), util.format(res.lingua.content.notify.response.body, question.title), res.locals.siteUrl + '/questions/' + question.slug );

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
                question: function(callback){

                    models.questions.findOne({ slug: req.params.slug },function(err,question){
                        if( !err && question ){

                            question.title = helpers.util.parseTitle(question.title);

                            question.date = moment(question.created_at).format('MMMM Do YYYY, h:mm:ss a');

                            if( question.responses.length > 0 ){
                                var i = 0;
                                question.responses.forEach(function(response){
                                    question.responses[i].date = moment(response.created_at).fromNow();
                                    i++;
                                });
                            }

                            callback(null, question);

                        }

                        else{

                            callback(null, null);

                        }

                    });

                },
                questions: function(callback){

                    var q = models.questions.find({}).sort({'created_at': -1}).limit(50);

                    q.exec(function(err, questions) {

                        if( !err && questions ){

                            callback(null, questions);

                        }
                        else{

                            callback(null, null);

                        }


                    });

                }
            },
            function(err, results) {

                if( results.question && results.questions ){

                    var permissions = false;

                    var user = user || req.session.user;

                    if( user && req.session.user.username === results.question.author.username ){
                        permissions = true;
                    }

                    res.render('template/question/question.jade',{ marked: new helpers.marked.parse(marked), question: results.question, questions: results.questions, user: user, permissions: permissions });

                }
                else{
                    res.send('404');
                }

        });

    }


}

exports.create = function( req, res ){

    switch ( req.method ){
        case 'GET':
            res.render('template/question/create.jade',{ form: req.body });
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

            //console.log( author );

            //
            models.questions.findOne({ slug: slug },function(err,question){
                if( err ){
                    error = err;
                }
                else{
                    if( question ){

                        error = res.lingua.content.questions.create.form.exist;
                        res.render('template/question/create.jade', { error: error, form: req.body });

                    }
                    else{

                        if( error ){

                            res.render('template/question/create.jade', { error: error, form: req.body });

                        }
                        else{

                            var new_question = new models.questions;

                            new_question.slug = slug;
                            new_question.title = title;
                            new_question.content = content;
                            new_question.author = author;

                            new_question.save(function( err ){
                                if( err ){
                                    res.render('template/question/create.jade', { error: error, form: req.body });
                                }
                                else{
                                    var params = {};
                                    params.name = req.session.user.name;
                                    params.username = req.session.user.username;
                                    params.slug = slug;
                                    params.title = title;
                                    helpers.users.addActivity('new_question', params, req.socketio);
                                    res.redirect('/questions/'+slug);
                                }

                            });

                        }


                    }



                }

            });

            break;
    }


}

exports.edit = function( req, res ){

    switch ( req.method ){
        case 'GET':

            models.questions.findOne({ slug: req.params.slug },function(err,post){
                if( !err && post ){

                    if( post.author.username === req.session.user.username ){

                        req.body.title = post.title;
                        req.body.content = post.content;
                        res.render('template/question/create.jade',{ form: req.body, mode: "edit" });

                    }
                    else{
                        res.redirect('/');
                    }

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

            models.questions.findOne({ slug: req.params.slug },function(err,post){
                if( err ){
                    res.redirect('');
                }
                else{
                    if( post ){

                        if( post.author.username === req.session.user.username ){

                            post.title = title;
                            post.content = content;

                            post.save(function( err ){
                                if( err ){
                                    res.render('template/question/create.jade', { error: error, form: req.body });
                                }
                                else{
                                    res.redirect('/questions/'+req.params.slug);
                                }

                            });

                        }
                        else{
                            res.redirect('/questions/'+req.params.slug);
                        }

                    }

                }

            });

            break;
    }
}