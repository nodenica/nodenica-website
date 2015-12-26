var helpers = require( '../helpers' );

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

    /**
     * Retrieves an user by username. The query is done using case insentive
     * regexs.
     **/
    schema.statics.findByUsername = function(username, projection, cb) {
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

    /**
     * Retrieves an user by email. The query is done using case insentive regexs.
     **/
    schema.statics.findByEmail = function(email, projection, cb) {
        if (arguments.length < 3) {
            cb = projection
            projection = undefined;
        };

        var findExpression = new RegExp(
            '^' + email.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$'
        );

        this.findOne(
            {email: { $regex: findExpression, $options: 'i'} },
            projection,
            cb
        );
    };

    schema.statics.findByCredentials = function(username, password, projection, cb) {
        if (arguments.length < 4) {
            cb = projection
            projection = undefined;
        };

        this.findByUsername(username, projection, function(err, user) {
            if (err) {
                return cb(err, user);
            };

            if (user.password!==helpers.users.passwordHash(password)) {
                cb(err, undefined);
                return
            };

            return cb(err, user);
        });
    };

    _db.model( file_name, schema);

    var data = _db.model( file_name );

    return data;
};
