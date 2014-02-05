exports.setup = function(_mongoose,_db){

    var file_name = require('path').basename( __filename, '.js' );

    var schema = _mongoose.Schema({
        slug: { type: String, index: { unique: true } },
        title: String,
        content: String,
        author: {
            username: String,
            email: String,
            avatar: String },
        comments: [{
            author: {
                username: String,
                email: String,
                avatar: String
            },
            content: String,
            created_at: { type: Date, default: Date.now }
        }],
        created_at: { type: Date, default: Date.now }
    });

    _db.model( file_name, schema);

    var data = _db.model( file_name );

    return data;
};