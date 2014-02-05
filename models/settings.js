exports.setup = function(_mongoose,_db){

    var file_name = require('path').basename( __filename, '.js' );

    var schema = _mongoose.Schema({
        key: { type: String, index: { unique: true } },
        value: {}
    });

    _db.model( file_name, schema);

    var data = _db.model( file_name );

    return data;
};