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

    schema.statics.findByUsername = function(username, projection, cb) {
        // Retrieves a user by his username using case insensitive regexp.
        // We use these slower regexps because of issue #9.
        if (arguments.length < 3) {
            cb = projection
            projection = undefined;
        };

        // escape username. Avoid abuses like ".*" as username
        var findExpression = new RegExp(
            '^' + username.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$'
        );

        this.findOne(
            {username: { $regex: findExpression, $options: 'i'} },
            projection,
            cb
        );
    };

    _db.model( file_name, schema);

    var data = _db.model( file_name );

    return data;
};
