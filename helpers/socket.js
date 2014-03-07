/**
 * Socket io middleware
 *
 * @param _io
 */
exports.use = function(_io){

    var self = this;

    self.start = function(data){

        data.on("new_message", self.send);

    }

    self.send = function( data ){
        _io.sockets.emit("wsGet",data);
    }

    _io.sockets.on("connection", self.start);

}

/**
 * Express middleware
 *
 * @param io
 * @returns {socket}
 */
exports.express = function( io ){

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
exports.authorization = function (handshakeData, accept) {

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
}