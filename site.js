var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var cookie  =   require('cookie')
var connect =   require('connect');
var lingua  = require('lingua');
var models = require('./models');
var routes = require('./routes');
var config = require('./config');
var site = require('./helpers').site;
var pid = require('./helpers').pid;
var email = require('./helpers').email;
var tweets = require('./helpers').tweets;
var socket = require('./helpers').socket;
var util = require('util');
var redis = require('redis');
var redisDb = redis.createClient();

var socketio = new socket.use( io );

// send data to newrelic
if( site.isProduction() ){
    require('newrelic');
}

// handle hashtag and store
tweets.enable(socketio);


io.set('log level', 1);

io.set('authorization', function (handshakeData, accept) {

    if (handshakeData.headers.cookie) {

        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');

        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
            return accept('Cookie is invalid.', false);
        }

    } else {
        return accept('No cookie transmitted.', false);
    }

    accept(null, true);
});

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
app.use(express.session({ secret: '023197422617bce43335cbd3c675aeed', key: 'express.sid' }));

// Set public directory
app.use(express.static(__dirname + '/public'));

// Set language
app.use(lingua(app, {
    defaultLocale: config.lang,
    path: __dirname + '/i18n'
}));

app.use(site.title);

app.use(site.url);

app.use(socket.express(socketio));

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