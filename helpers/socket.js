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

exports.express = function( io ){

    //console.log( io );

    return function socket(req, res, next) {
        req.socketio = io;
        next();
    }

}