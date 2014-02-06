var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var lingua  = require('lingua');
var models = require('./models');
var routes = require('./routes');
var config = require('./config');
var site = require('./helpers').site;
var us = require('./helpers').users;
var pid = require('./helpers').pid;
var email = require('./helpers').email;
var tweets = require('./helpers').tweets;
var util = require('util');
var redis = require('redis');
var redisDb = redis.createClient();

// send data to newrelic
if( site.isProduction() ){
    require('newrelic');
}

// handle hashtag and store
tweets.enable();


io.set('log level', 1);

server.listen( config.port );

var express = require('express');

// set view directory
app.set('views', __dirname + '/views');

// set view engine
app.set('view engine', 'jade');

// Set json parser
app.use(express.json());

// Set urlencoded
app.use(express.urlencoded());

// Set cookie parser
app.use(express.cookieParser());
app.use(express.session({ secret: '023197422617bce43335cbd3c675aeed' }));

// Set public directory
app.use(express.static(__dirname + '/public'));

// Set language
app.use(lingua(app, {
    defaultLocale: config.lang,
    path: __dirname + '/i18n'
}));

app.use(site.title);

app.use(site.url);

// Users online
app.use(function(req, res, next){
    var ua = req.headers['user-agent'];
    redisDb.zadd('online', Date.now(), ua, next);
});

app.use(function(req, res, next){
    var min = 60 * 1000;
    var ago = Date.now() - min;
    redisDb.zrevrangebyscore('online', '+inf', ago, function(err, users){
        if (err) return next(err);
        req.online = users;
        res.locals.online = util.format(res.lingua.content.home.online.content, req.online.length);
        next();
    });
});


// Validate installation
app.use(function(req, res, next){

    us.addActivity('a','b');

    res.locals.user = req.session.user;

    if( req.url != '/install' ){

        models.users.count({}, function(err, c){
            if( err ){
                res.render('install/index.jade', {error: err});
            }
            else{
                if( c === 0 ){
                    res.redirect('/install');
                }
                else{
                    next();
                }
            }
        });

    }
    else{
        next();
    }

});

pid.make();

routes.setup( app );