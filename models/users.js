exports.setup = function(_mongoose,_db){

    var file_name = require('path').basename( __filename, '.js' );

    var schema = _mongoose.Schema({
        username: { type: String, index: { unique: true } },
        first_name: String,
        last_name: String,
        name: String,
        email: String,
        password: String,
        created_at: { type: Date, default: Date.now },
        range: {type: Number, default: 3},
        active: {type: Boolean, default: false},
        badges: [],
        repositories: [],
        modules: [],
        stars: [],
        activity: [{
            content: String,
            created_at: {
                type: Date,
                default: Date.now
            }
        }],
        forgot_token: String,
        active_token: String,
        avatar: String
    });

    _db.model( file_name, schema);

    var data = _db.model( file_name );

    return data;
};