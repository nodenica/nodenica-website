var cookie = require('cookie'),
    parseSignedCookie = require('connect').utils.parseSignedCookie,
    ConnectSession = require('connect').middleware.session.Session,
    config = require('../config');
var helpers = require('../helpers');
var express = require('express');
var MongoStore = require('connect-mongo')(express);

/**
 * Socket io middleware
 *
 * @param _io
 */
exports.use = function (_io) {

    var self = this;

    self.start = function (data) {

        data.on("new_message", self.send);

    }

    self.send = function (data) {
        _io.sockets.emit("wsGet", data);
    }

    _io.sockets.on("connection", self.start);

}

/**
 * Express middleware
 *
 * @param io
 * @returns {socket}
 */
exports.express = function (io) {

    return function socket(req, res, next) {
        req.socketio = io;
        next();
    }

}

/**
 * Authorization
 *
 * @param handshakeData
 * @param accept
 * @returns {*}
 */
exports.authorization = function (handshake, accept) {

    // If a cookie override was provided in the query string, use it.
    // (e.g. ?cookie=sails.sid=a4g8dsgajsdgadsgasd)
    if (handshake.query.cookie) {
        handshake.headers.cookie = handshake.query.cookie;
    }


    // Parse and decrypt cookie and save it in the handshake
    if (handshake.headers.cookie) {

        // Decrypt cookie into session id using session secret
        // Maintain sessionID in socket so that the session can be queried before processing each incoming message
        try {
            handshake.cookie = cookie.parse(handshake.headers.cookie);
            handshake.sessionID = parseSignedCookie(handshake.cookie[config.express.key], config.express.secret);
        }
        catch (e) {
            return socketConnectionError(accept,
                'Connect encountered error parsing cookie! \n' + e);
        }

        // TODO:	As an optimization, make sessions on sockets disableable
        //			(useful for scenarios with volatile messages, e.g. analytics)

        // Get session
        new MongoStore({
            host: config.mongodb.host,
            port: config.mongodb.port,
            db: config.mongodb.db,
            username: config.mongodb.username,
            password: config.mongodb.password
        }).get(handshake.sessionID, function (err, session) {

            // An error occurred, so refuse the connection
            if (err) {
                return socketConnectionError(accept,
                    'Error loading session from socket.io! \n' + err,
                    'Error loading session from socket.io!');
            }

            // Cookie is present, but doesn't correspond to a known session
            // So generate a new session to match it.
            else if (!session) {
                handshake.session = new ConnectSession(handshake, {
                    cookie: {
                        // Prevent access from client-side javascript
                        httpOnly: true
                    }
                });
                accept(null, true);
            }

            // Parsed cookie matches a known session- onward!
            else {

                // Create a session object, passing our just-acquired session handshake
                handshake.session = new ConnectSession(handshake, session);
                accept(null, true);
            }
        });
    }
    else {

        return socketConnectionError(accept,

            'No cookie transmitted with socket.io connection.  ' +
                'Are you trying to access your Sails.js server via socket.io on a 3rd party domain?  ' +
                'If you\'re ok with losing users\' session data, you can set `authorization: false` to disable cookie-checking.  ' +
                'Or you can send a JSONP request first from the client to the Sails.js server to get the cookie ' +
                '(be sure it\'s the same domain!!)',

            'No cookie transmitted with socket.io connection.');
    }
};





/**
 * Fired when an internal server error occurs while authorizing the socket
 */

function socketConnectionError(accept, devMsg, prodMsg) {
    var msg;
    if (!helpers.site.isProduction()) {
        msg = devMsg;
    }
    else msg = prodMsg;
    return accept(msg, false);
}